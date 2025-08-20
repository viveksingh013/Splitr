# Splitzy 💰

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![Convex](https://img.shields.io/badge/Convex-1.25.4-green)](https://convex.dev/)

Splitzy is an open-source expense-sharing platform built on Next.js, offering a scalable architecture for managing group finances, settlements, and user interactions. It combines a rich set of UI components, secure middleware, backend functions, and AI-powered insights to streamline collaborative expense tracking and provide intelligent financial recommendations.

## ✨ Features

- **🔐 Secure Authentication** - Built with Clerk for robust user management
- **👥 Group Management** - Create and manage expense groups with role-based permissions
- **💰 Expense Tracking** - Add expenses with flexible splitting options (equal, percentage, exact amounts)
- **📊 Balance Summaries** - Real-time balance tracking and settlement calculations
- **📱 Responsive Design** - Modern UI built with Tailwind CSS and shadcn/ui components
- **📧 Email Notifications** - Automated payment reminders and spending insights via Inngest
- **🔄 Real-time Updates** - Live data synchronization using Convex
- **🤖 AI-Powered Insights** - Intelligent spending analysis and recommendations using Google Gemini AI

## 🚀 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Pre-built, accessible UI components
- **Lucide React** - Beautiful icon library

### Backend & Database

- **Convex** - Real-time database and backend functions
- **Clerk** - Authentication and user management
- **Inngest** - Event-driven background job processing and workflow management
- **Google Gemini AI** - AI-powered spending insights and financial recommendations

### Development Tools

- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing
- **TypeScript** - Type safety (via jsconfig.json)

## 📁 Project Structure

```
splitr/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Main application routes
│   │   ├── dashboard/     # Dashboard components
│   │   ├── expenses/      # Expense management
│   │   ├── groups/        # Group management
│   │   ├── contacts/      # Contact management
│   │   └── settlements/   # Settlement handling
│   └── api/               # API routes
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── convex/               # Convex backend functions
│   ├── schema.js         # Database schema
│   ├── expenses.js       # Expense operations
│   ├── groups.js         # Group operations
│   └── settlements.js    # Settlement operations
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Convex account
- Clerk account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/viveksingh013/splitzy.git
   cd splitzy
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   CONVEX_DEPLOY_KEY=your_convex_deploy_key
   ```

4. **Set up Convex**

   ```bash
   npx convex dev
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

Splitzy uses a well-structured database schema with the following main entities:

- **Users** - User profiles and authentication
- **Groups** - Expense groups with member management
- **Expenses** - Individual expenses with splitting logic
- **Settlements** - Payment settlements between users

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 Key Features Explained

### Expense Splitting

- **Equal Split**: Divide expense equally among all participants
- **Percentage Split**: Custom percentage-based distribution
- **Exact Amount**: Specify exact amounts for each participant

### Group Management

- **Role-based Access**: Admin and member roles with different permissions
- **Member Invitations**: Easy group member management
- **Group Analytics**: Spending insights and balance summaries

### Settlement System

- **Automatic Calculations**: Real-time balance calculations
- **Payment Tracking**: Track settlements and outstanding amounts
- **Reminder System**: Automated payment reminders

### AI-Powered Analytics

- **Smart Spending Analysis**: AI-generated insights on spending patterns
- **Financial Recommendations**: Personalized advice for better money management
- **Category Intelligence**: Automatic expense categorization and trend analysis

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Convex](https://convex.dev/) for real-time backend infrastructure
- [Clerk](https://clerk.com/) for authentication solutions
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for pre-built, accessible UI components
- [Google Gemini AI](https://ai.google.dev/) for intelligent financial insights

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the documentation
- Reach out to the maintainers

---

**Built with ❤️ by Vivek Singh**
