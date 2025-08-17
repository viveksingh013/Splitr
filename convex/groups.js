import { query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/* ============================================================
   Query 1: getGroupOrMembers
   ------------------------------------------------------------
   - Purpose: Fetch the groups that the current user belongs to.
   - If a specific groupId is provided, return that group's details
     along with detailed member info.
   - Otherwise, return only the list of groups the user is in.
   ============================================================ */
export const getGroupOrMembers = query({
  args: {
    groupId: v.optional(v.id("groups")), // Optional param - if passed, fetch details for only this group
  },
  handler: async (ctx, args) => {
    // Get the currently logged-in user (centralized helper is used)
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    // Fetch all groups from DB
    const allGroups = await ctx.db.query("groups").collect();

    // Filter groups where the current user is a member
    const userGroups = allGroups.filter((group) =>
      group.members.some((member) => member.userId === currentUser._id)
    );

    // ✅ Case 1: If a specific groupId is provided
    if (args.groupId) {
      // Find the group inside the user's groups
      const selectedGroup = userGroups.find(
        (group) => group._id === args.groupId
      );

      // If user is not in this group or it doesn't exist → throw error
      if (!selectedGroup) {
        throw new Error("Group not found or you're not a member");
      }

      // Fetch full details of all group members (since "members" only has ids + roles)
      const memberDetails = await Promise.all(
        selectedGroup.members.map(async (member) => {
          const user = await ctx.db.get(member.userId); // fetch user by ID
          if (!user) return null; // In case a user record was deleted

          // Return full profile info of the member
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            role: member.role, // role from group membership object
          };
        })
      );

      // Remove null values (deleted users, if any)
      const validMembers = memberDetails.filter((member) => member !== null);

      // Return:
      // 1. Full details of the selected group including members
      // 2. List of all groups user is in (with only summary info)
      return {
        selectedGroup: {
          id: selectedGroup._id,
          name: selectedGroup.name,
          description: selectedGroup.description,
          createdBy: selectedGroup.createdBy,
          members: validMembers,
        },
        groups: userGroups.map((group) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length, // count of members
        })),
      };
    } 
    // ✅ Case 2: If no groupId is provided, return only groups list
    else {
      return {
        selectedGroup: null, // no specific group selected
        groups: userGroups.map((group) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
        })),
      };
    }
  },
});

/* ============================================================
   Query 2: getGroupExpenses
   ------------------------------------------------------------
   - Purpose: Fetch all expenses + settlements of a group.
   - Also calculates balances (who owes whom, net balances, etc.)
   - Ensures that only members of the group can view the data.
   ============================================================ */
export const getGroupExpenses = query({
  args: { groupId: v.id("groups") }, // groupId is required
  handler: async (ctx, { groupId }) => {
    // Get the currently logged-in user
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    // Fetch the group by ID
    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");

    // Ensure user is a member of this group
    if (!group.members.some((m) => m.userId === currentUser._id))
      throw new Error("You are not a member of this group");

    // Fetch all expenses of the group (via index "by_group")
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    // Fetch all settlements for this group
    const settlements = await ctx.db
      .query("settlements")
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .collect();

    /* ----------  Step 1: Build member lookup ---------- */
    const memberDetails = await Promise.all(
      group.members.map(async (m) => {
        const u = await ctx.db.get(m.userId); // fetch each member
        return { id: u._id, name: u.name, imageUrl: u.imageUrl, role: m.role };
      })
    );
    const ids = memberDetails.map((m) => m.id); // array of member IDs

    /* ----------  Step 2: Initialize ledgers ---------- */
    // Net balance of each user (total owed - total paid)
    const totals = Object.fromEntries(ids.map((id) => [id, 0]));

    // Pairwise ledger: debtor → creditor → amount owed
    const ledger = {};
    ids.forEach((a) => {
      ledger[a] = {};
      ids.forEach((b) => {
        if (a !== b) ledger[a][b] = 0;
      });
    });

    /* ----------  Step 3: Apply expenses ---------- */
    for (const exp of expenses) {
      const payer = exp.paidByUserId; // who paid
      for (const split of exp.splits) {
        // Skip payer themselves & already settled splits
        if (split.userId === payer || split.paid) continue;

        const debtor = split.userId; // who owes
        const amt = split.amount;

        // Update net totals
        totals[payer] += amt;
        totals[debtor] -= amt;

        // Record in ledger (debtor owes payer)
        ledger[debtor][payer] += amt;
      }
    }

    /* ----------  Step 4: Apply settlements ---------- */
    for (const s of settlements) {
      // Settlement means one member repaid another
      totals[s.paidByUserId] += s.amount;         // payer gets back
      totals[s.receivedByUserId] -= s.amount;     // receiver’s owed reduces

      // Reduce amount in ledger (payer has already paid back)
      ledger[s.paidByUserId][s.receivedByUserId] -= s.amount;
    }

    /* ----------  Step 5: Net off ledger balances ---------- */
    // Ensures that for each pair (A,B), only one direction has a positive balance
    ids.forEach((a) => {
      ids.forEach((b) => {
        if (a >= b) return; // Only compute once per pair

        const diff = ledger[a][b] - ledger[b][a];
        if (diff > 0) {
          ledger[a][b] = diff;
          ledger[b][a] = 0;
        } else if (diff < 0) {
          ledger[b][a] = -diff;
          ledger[a][b] = 0;
        } else {
          // Perfectly settled
          ledger[a][b] = ledger[b][a] = 0;
        }
      });
    });

    /* ----------  Step 6: Shape balances per member ---------- */
    const balances = memberDetails.map((m) => ({
      ...m,
      totalBalance: totals[m.id], // net balance
      owes: Object.entries(ledger[m.id]) // who this member owes to
        .filter(([, v]) => v > 0)
        .map(([to, amount]) => ({ to, amount })),
      owedBy: ids // who owes this member
        .filter((other) => ledger[other][m.id] > 0)
        .map((other) => ({ from: other, amount: ledger[other][m.id] })),
    }));

    /* ----------  Step 7: Build a lookup map for quick access ---------- */
    const userLookupMap = {};
    memberDetails.forEach((member) => {
      userLookupMap[member.id] = member;
    });

    /* ----------  Step 8: Final response ---------- */
    return {
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
      },
      members: memberDetails,  // group members with details
      expenses,                // all group expenses
      settlements,             // all settlements
      balances,                // computed balances
      userLookupMap,           // helper for frontend lookups
    };
  },
});