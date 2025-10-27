# Retrospecta

An AI-powered decision journal that helps you record complex life and work decisions, then analyzes them using advanced language models to provide deep insights about your decision-making patterns.

## Overview

Retrospecta enables you to:

- Record decisions with context (situation, decision made, reasoning)
- Receive AI-powered analysis identifying decision types and cognitive biases
- Discover overlooked alternatives and get actionable insights
- Track your decision-making patterns over time with analytics dashboard
- Filter and sort decisions by category, bias type, and date range

## Core Features

### Decision Management

- Create decision entries with detailed context
- Real-time AI analysis using Google Gemini 2.0 Flash
- Live status updates via Server-Sent Events
- Re-analyze decisions to get fresh perspectives
- Delete decisions with optimistic UI updates

### Analytics Dashboard

- Visual breakdown of decision types (emotional, strategic, analytical, etc.)
- Cognitive bias frequency analysis
- Summary statistics (total, completed, pending, failed decisions)

### Advanced Filtering & Sorting

- Multi-select filters for decision categories (9 types)
- Multi-select filters for cognitive biases (17 common biases)
- Date range filtering with calendar picker
- Sort by date, status, or category
- Real-time filter application via streaming updates

### User Experience

- Dark/light theme support
- User profile with avatar and menu
- Optimistic UI updates for instant feedback
- Toast notifications for status changes
- Skeleton loading states
- Pagination support
- Responsive mobile-friendly design

## Tech Stack

### Frontend & Framework

- **Next.js 16** - Full-stack React framework with App Router and Turbopack
- **React 19.2** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Chakra UI v3** - Modern component library with dark mode support
- **Framer Motion** - Smooth animations and transitions

### Backend & Database

- **PostgreSQL** - Relational database via Supabase
- **Prisma ORM** - Type-safe database access with migrations
- **Supabase** - Database hosting and authentication service

### Authentication

- **Supabase Auth** - Secure authentication with session management
- **Google OAuth** - Social login integration
- **Email/Password** - Traditional authentication method

### AI Integration

- **Google Gemini 2.0 Flash** - Advanced LLM for decision analysis
- **Vercel AI SDK** - Framework-agnostic AI integration
- **Structured Output** - Type-safe AI responses with Zod schemas

### Real-time Updates

- **Server-Sent Events (SSE)** - Live decision status updates
- **Smart Polling** - 10-second intervals with exponential backoff
- **Optimistic Updates** - Instant UI feedback before server confirmation

### Development Tools

- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality checks
- **lint-staged** - Pre-commit linting

## Architecture Highlights

### State Management

- **React Context API** - Centralized decision state management
- **DecisionsContext** - Single source of truth for all decisions
- **Smart Change Detection** - Prevents unnecessary re-renders
- **Memoized Components** - Optimized DecisionCard rendering

### Database Design

- **User model** - Synced with Supabase Auth
- **Decision model** - Stores user input and AI analysis results
- **Enums** - Type-safe categories and status tracking
- **Indexes** - Optimized queries for userId, status, category, and date
- **Cascade Delete** - Clean data removal when users are deleted

### API Architecture

- **Server Actions** - Type-safe server-side mutations
- **SSE Endpoint** - `/api/decisions/stream` for real-time updates
- **Auth Middleware** - Protected routes and API endpoints
- **Error Handling** - Comprehensive error states and retry logic

### Security

- **Row-level Security** - Ownership validation for all operations
- **HTTP-only Cookies** - Secure session storage
- **Environment Variables** - Sensitive data protection
- **CSRF Protection** - Built-in Next.js security features

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, pnpm, yarn, or bun package manager
- Supabase account (free tier)
- Google AI Studio account (free tier)

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd retrospecta
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values:

   ```env
   # Database (from Supabase Dashboard > Settings > Database)
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

   # Supabase Auth (from Supabase Dashboard > Settings > API)
   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
   SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"

   # Google Gemini AI (from https://aistudio.google.com/)
   GOOGLE_GENERATIVE_AI_API_KEY="[YOUR_API_KEY]"

   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Enable Google OAuth in Authentication > Providers
   - Copy database credentials and API keys to `.env.local`

5. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://[PROJECT_ID].supabase.co/auth/v1/callback`
   - Copy Client ID & Secret to Supabase dashboard

6. **Run database migrations**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

7. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Deployment

### Deploy to Vercel

Retrospecta is optimized for deployment on [Vercel](https://vercel.com), the platform from the creators of Next.js.

#### Initial Deployment

1. **Push to GitHub**

   ```bash
   git remote add origin https://github.com/[username]/retrospecta.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://[project-name].vercel.app`

#### Continuous Deployment

- **Auto-deploy:** Every push to `main` branch triggers automatic deployment
- **Preview deployments:** Pull requests get unique preview URLs
- **Instant rollback:** One-click rollback in Vercel dashboard

## Project Structure

```
retrospecta/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration history
├── public/                    # Static assets
├── src/
│   ├── actions/               # Server Actions
│   │   ├── decisions/        # Decision CRUD and analytics
│   │   ├── analysis.ts       # LLM analysis actions
│   │   └── auth.ts           # Authentication actions
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/           # Auth routes (login, register)
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   └── api/              # API endpoints (SSE stream)
│   ├── components/
│   │   ├── auth/             # Auth components (forms, common)
│   │   ├── common/           # Shared components and skeletons
│   │   ├── dashboard/        # Dashboard and charts
│   │   ├── decisions/        # Decision management UI
│   │   │   ├── controls/     # Sorting and filter controls
│   │   │   ├── filters/      # Individual filter components
│   │   │   ├── form/         # Multi-step form components
│   │   │   ├── modals/       # Modal dialogs
│   │   │   ├── shared/       # Shared decision components
│   │   │   └── userMenu/     # User menu with avatar
│   │   ├── landing/          # Landing page components
│   │   └── ui/               # Chakra UI components
│   ├── constants/            # App constants and enums
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities, clients, helpers
│   │   ├── ai/               # AI/LLM integration
│   │   ├── supabase/         # Supabase clients
│   │   └── utils/            # Helper functions
│   ├── translations/         # i18n translations
│   └── types/                # TypeScript type definitions
└── .env.local                # Environment variables (not in repo)
```

## Key Technical Flows

### Decision Creation & Analysis

1. User submits decision form
2. Server Action creates decision with `PENDING` status
3. Background LLM analysis starts (non-blocking)
4. SSE stream sends real-time status updates
5. Analysis completes, results saved to database
6. UI updates instantly with toast notification

### Real-time Updates

- Server-Sent Events maintain persistent connection
- 10-second polling interval for decision updates
- Automatic reconnection with exponential backoff
- Optimistic updates for immediate UI feedback
- Smart change detection prevents unnecessary re-renders

### Filtering & Sorting

- Client sends filter/sort parameters via URL query
- SSE endpoint applies Prisma where clauses and orderBy
- Results stream in real-time to connected clients
- UI updates instantly without page reload

## Contributing

This is a demo project. Feel free to fork and adapt for your own use.

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes
refactor: Code refactoring
test:     Adding tests
chore:    Build/tooling changes
```

## License

MIT License - feel free to use this project for learning and inspiration.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [Chakra UI](https://chakra-ui.com)
- Database and auth by [Supabase](https://supabase.com)
- AI powered by [Google Gemini](https://ai.google.dev)
- Deployed on [Vercel](https://vercel.com)
