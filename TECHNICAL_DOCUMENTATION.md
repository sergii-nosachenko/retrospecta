# Retrospecta - Technical Documentation

## Executive Summary

**Retrospecta** is an AI-Powered Decision Journal application that helps users record complex life or work decisions and receive deep insights through LLM analysis. The system analyzes decisions to identify decision types, cognitive biases, and overlooked alternatives.

**Timeline:** 2 days
**Status:** Phase 2 Complete, Phase 3.1 Complete (Dark Theme + User Menu)
**Deployment:** Vercel
**Demo URL:** TBD

---

## Table of Contents

1. [Project Requirements](#project-requirements)
2. [Tech Stack](#tech-stack)
3. [Architecture & Design Principles](#architecture--design-principles)
4. [Database Schema](#database-schema)
5. [Feature Breakdown](#feature-breakdown)
6. [Implementation Phases](#implementation-phases)
7. [Project Structure](#project-structure)
8. [Key Technical Flows](#key-technical-flows)
9. [Environment Setup](#environment-setup)
10. [Deployment Strategy](#deployment-strategy)
11. [Git Workflow](#git-workflow)
12. [Future Enhancements](#future-enhancements)

---

## Project Requirements

### Core Functional Blocks

1. **User Registration & Authentication**
   - Real authentication system
   - Email/password + Google OAuth

2. **Decision Entry Form**
   - Description of situation
   - Decision made
   - Optional: reasoning behind decision
   - Background processing trigger

3. **LLM-Powered Analysis**
   - Decision category (emotional, strategic, impulsive, etc.)
   - Potential cognitive biases identified
   - Overlooked alternatives or paths
   - English output (architecture supports i18n)

4. **Decision History**
   - List all user decisions
   - Display original text + analysis
   - Processing status indicator ("processing", "ready", "error")

5. **UX Requirements**
   - Loading states
   - Error handling with retry capability
   - Clear feedback when analysis pending/failed

### MVP Bonus Features (Included)

- ✅ Dark theme with user menu integration
- ✅ User profile dropdown with avatar
- ⏳ Sorting (by time, status, etc.) - In Progress
- ⏳ Re-analysis capability - Planned

### Future Enhancements (Architecture Ready)

- Dashboard with visualization of decision types/biases
- Filter by categories, types, biases
- Advanced sorting options

---

## Tech Stack

### Core Framework & Language

| Technology     | Version            | Rationale                                                                 |
| -------------- | ------------------ | ------------------------------------------------------------------------- |
| **Next.js**    | 16 (latest stable) | Full-stack React framework with App Router, Turbopack, React 19.2 support |
| **TypeScript** | Latest             | Type safety, better DX, fewer runtime errors                              |
| **React**      | 19.2               | Required by Next.js 16, latest features                                   |

### Database & ORM

| Technology     | Service  | Rationale                                                                 |
| -------------- | -------- | ------------------------------------------------------------------------- |
| **PostgreSQL** | Supabase | Free tier: 500MB DB, built-in auth, real-time capabilities                |
| **Prisma ORM** | Latest   | Type-safe queries, excellent TypeScript integration, migration management |

### Authentication

| Technology          | Provider                   | Rationale                                                     |
| ------------------- | -------------------------- | ------------------------------------------------------------- |
| **Supabase Auth**   | Supabase                   | Built-in with database, supports OAuth, 50K MAUs on free tier |
| **OAuth Providers** | Google (+ optional GitHub) | Better UX, most users have Google accounts                    |

### AI/LLM Integration

| Technology        | Provider                       | Rationale                                                                          |
| ----------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| **Vercel AI SDK** | Open source (free)             | TypeScript-first, framework-agnostic, multi-provider support                       |
| **Google Gemini** | 2.5 Flash via Google AI Studio | Free tier: 1M tokens/min, excellent for structured analysis, permanent free access |

### UI/Design System

| Technology    | Version     | Rationale                                                                                                |
| ------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| **Chakra UI** | v3 (latest) | Fast setup (~15min), built-in dark mode, excellent form components, MCP server available for Claude Code |
| **Emotion**   | Latest      | Required by Chakra UI for CSS-in-JS                                                                      |

### Deployment & Hosting

| Technology         | Plan         | Rationale                                                              |
| ------------------ | ------------ | ---------------------------------------------------------------------- |
| **Vercel**         | Hobby (free) | Native Next.js support, auto-deploy, edge functions, 60h compute/month |
| **Vercel Logging** | Built-in     | Console.log capture in dashboard, sufficient for MVP                   |

### Development Tools

| Technology               | Purpose              |
| ------------------------ | -------------------- |
| **ESLint**               | Code linting         |
| **Prettier**             | Code formatting      |
| **Conventional Commits** | Git commit standards |

---

## Architecture & Design Principles

### 1. **Separation of Concerns**

```
├── app/                    # Next.js App Router pages & API routes
├── components/             # React components (organized by feature)
├── lib/                    # Utilities, configs, clients
│   ├── prisma.ts          # Prisma client singleton
│   ├── supabase/          # Supabase client utilities
│   ├── ai/                # AI/LLM integration
│   └── utils.ts           # Helper functions
├── types/                  # TypeScript type definitions
└── prisma/                 # Database schema & migrations
```

### 2. **Database Access Pattern**

- **Server Components & Server Actions:** Direct Prisma queries
- **Client Components:** API Routes → Prisma
- **No direct database access from client**

### 3. **Authentication Flow**

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────→│  Supabase    │─────→│  Prisma DB  │
│  Component  │      │  Auth Check  │      │   (users)   │
└─────────────┘      └──────────────┘      └─────────────┘
       ↓
  Protected Route
  Middleware Check
```

### 4. **LLM Analysis Flow (Optimistic UI + Polling)**

```
User submits form
    ↓
Save decision to DB (status: "pending")
    ↓
Return immediately with decision ID
    ↓
Client polls every 2-3 seconds
    ↓
Server Action: trigger LLM analysis
    ↓
Update decision (status: "completed", analysis: {...})
    ↓
Client receives updated data
    ↓
Display analysis
```

### 5. **Internationalization Architecture**

- **Current:** English-only analysis prompts
- **Design:** LLM prompts extracted to `/lib/ai/prompts/` with language parameter
- **Future:** Simple to add `locale` parameter and multi-language prompt templates

### 6. **Extensibility for Future Features**

#### **Filters & Search**

- Database schema includes indexed fields for filtering
- Prisma queries support `where` clauses (ready to add)
- UI architecture uses reusable filter components

#### **Dashboard/Analytics**

- Decision categories stored as enum
- Bias data stored as JSON array (aggregatable)
- Separate analytics service layer ready to add

---

## Database Schema

### Prisma Schema Design

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model (synced with Supabase Auth)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  avatarUrl String?  @map("avatar_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  decisions Decision[]

  @@map("users")
}

// Decision categories enum
enum DecisionCategory {
  EMOTIONAL
  STRATEGIC
  IMPULSIVE
  ANALYTICAL
  INTUITIVE
  COLLABORATIVE
  RISK_AVERSE
  RISK_TAKING
  OTHER

  @@map("decision_category")
}

// Processing status enum
enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED

  @@map("processing_status")
}

// Main decision model
model Decision {
  id          String            @id @default(uuid())
  userId      String            @map("user_id")

  // User input
  situation   String            @db.Text
  decision    String            @db.Text
  reasoning   String?           @db.Text

  // LLM analysis results
  status      ProcessingStatus  @default(PENDING)
  category    DecisionCategory?
  biases      String[]          // Array of cognitive bias names
  alternatives String?          @db.Text // Overlooked alternatives
  insights    String?           @db.Text // Additional insights

  // Metadata
  analysisAttempts Int      @default(0) @map("analysis_attempts")
  lastAnalyzedAt   DateTime? @map("last_analyzed_at")
  errorMessage     String?   @db.Text @map("error_message")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Indexes for performance
  @@index([userId])
  @@index([status])
  @@index([category])
  @@index([createdAt])
  @@map("decisions")
}
```

### Database Relationships

- **One-to-Many:** User → Decisions
- **Cascade Delete:** Deleting user removes all their decisions
- **Indexes:** Optimized for common queries (userId, status, category, createdAt)

---

## Feature Breakdown

### Phase 1: Foundation (Day 1, Morning - 3-4 hours) ✅ COMPLETED

#### 1.1 Project Setup (1 hour) ✅ COMPLETED

- [x] Initialize Next.js 16 project with TypeScript
- [x] Install and configure dependencies
- [x] Setup Chakra UI v3 with App Router
- [x] Configure Prettier & ESLint
- [x] Setup Git with conventional commits
- [x] Setup pre-commit hooks with Husky and lint-staged

#### 1.2 Database & Auth Setup (2 hours) ✅ COMPLETED

- [x] Create Supabase project
- [x] Configure Prisma with Supabase PostgreSQL
- [x] Create database schema and run migrations
- [x] Setup Supabase Auth (email/password + Google OAuth)
- [x] Create auth middleware for protected routes
- [x] Build auth UI components (login/register/logout)

#### 1.3 AI Integration Setup (1 hour) ✅ COMPLETED

- [x] Install Vercel AI SDK
- [x] Configure Google Gemini API
- [x] Create LLM service wrapper with typed responses
- [x] Design analysis prompt templates
- [x] Test basic LLM integration

### Phase 2: Core Features (Day 1, Afternoon - 4-5 hours) ✅ COMPLETED

#### 2.1 Decision Entry (2 hours) ✅ COMPLETED

- [x] Create decision form with validation
- [x] Implement form submission with Server Action
- [x] Save decision to database (status: PENDING)
- [x] Implement optimistic UI response
- [x] Migrate form to modal for better UX
- [x] Fix React hydration errors (nested h2 tags)

#### 2.2 LLM Analysis Processing (2 hours) ✅ COMPLETED

- [x] Create background analysis Server Action
- [x] Implement structured LLM output parsing
- [x] Update decision with analysis results
- [x] Handle analysis errors with retry logic
- [x] Migrate to server-side polling (10-second intervals)
- [x] Implement Server-Sent Events (SSE) for real-time updates

#### 2.3 Decision History View (1 hour) ✅ COMPLETED

- [x] Create decision list page
- [x] Display decisions with status indicators
- [x] Show analysis results when completed
- [x] Implement basic sorting (newest first)
- [x] Add connection status indicators
- [x] Replace dedicated routes with modal-based UI
- [x] Add status change notifications with toast
- [x] Implement comprehensive padding/spacing improvements
- [x] Replace all loading states with Skeleton components
- [x] Center all modals on screen
- [x] Add minimum height constraints to form textareas

### Phase 3: MVP Enhancements (Day 2, Morning - 3-4 hours)

#### 3.1 Dark Theme (30 min) ✅ COMPLETED

- [x] Configure Chakra UI ColorModeProvider
- [x] Add theme toggle component (moved to user menu dropdown)
- [x] Test all components in dark mode
- [x] Create user menu component with avatar
- [x] Add user profile dropdown with avatar/initials fallback
- [x] Move theme toggle into user menu
- [x] Add logout functionality to user menu
- [x] Implement getCurrentUser() server action
- [x] Match button and avatar sizes for visual consistency
- [x] Keep menu open on theme switch (closeOnSelect: false)

#### 3.2 Sorting & Filtering (1 hour)

- [ ] Add sorting UI (by date, status, category)
- [ ] Implement server-side sorting in queries
- [ ] Add sorting state management

#### 3.3 Re-analysis Feature (1.5 hours)

- [ ] Add "Re-analyze" button to decision cards
- [ ] Implement re-analysis Server Action
- [ ] Update UI with new analysis
- [ ] Track analysis attempts

#### 3.4 Error Handling & UX Polish (1 hour) ✅ PARTIALLY COMPLETED

- [x] Add loading skeletons
- [ ] Implement error boundaries
- [x] Add retry mechanisms
- [x] Toast notifications for feedback
- [x] Empty states for no decisions
- [x] Comprehensive padding improvements across all components
- [x] Proper button padding for better UX
- [x] Modal inner and outer padding optimization

### Phase 4: Polish & Deploy (Day 2, Afternoon - 3-4 hours)

#### 4.1 UI/UX Refinement (1.5 hours)

- [ ] Responsive design testing
- [ ] Accessibility improvements
- [ ] Animation polish
- [ ] Copy refinement

#### 4.2 Testing & Bug Fixes (1 hour)

- [ ] Manual testing all flows
- [ ] Fix discovered bugs
- [ ] Edge case handling

#### 4.3 README & Documentation (30 min)

- [ ] Write comprehensive README
- [ ] Add setup instructions
- [ ] Document environment variables
- [ ] Add screenshots

#### 4.4 Deployment (1 hour)

- [ ] Setup Vercel project
- [ ] Configure environment variables
- [ ] Deploy to production
- [ ] Test production deployment
- [ ] Verify all features work

---

## Project Structure

```
retrospecta/
├── .env.local                    # Local environment variables (gitignored)
├── .env.example                  # Example env file for documentation
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── prettier.config.js
├── eslint.config.js
├── README.md
├── TECHNICAL_DOCUMENTATION.md    # This file
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Migration history
│
├── public/                      # Static assets
│   ├── favicon.ico
│   └── images/
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout with Chakra Provider
│   │   ├── page.tsx             # Home/landing page
│   │   ├── providers.tsx        # Client-side providers wrapper
│   │   │
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/         # Protected route group
│   │   │   ├── layout.tsx       # Dashboard layout
│   │   │   ├── decisions/
│   │   │   │   ├── page.tsx     # Decision list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx # New decision form
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Decision detail
│   │   │   └── settings/
│   │   │       └── page.tsx     # User settings
│   │   │
│   │   └── api/                 # API routes (if needed)
│   │       ├── auth/
│   │       └── webhooks/
│   │
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── UserMenu.tsx     # User profile dropdown with avatar, theme toggle, logout
│   │   │
│   │   ├── auth/                # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── OAuthButtons.tsx
│   │   │
│   │   ├── decisions/           # Decision feature components
│   │   │   ├── DecisionForm.tsx
│   │   │   ├── DecisionCard.tsx
│   │   │   ├── DecisionList.tsx
│   │   │   ├── DecisionDetail.tsx
│   │   │   ├── AnalysisDisplay.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── SortingControls.tsx
│   │   │   └── ReAnalyzeButton.tsx
│   │   │
│   │   └── common/              # Common components
│   │       ├── LoadingSkeleton.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts        # Supabase client for client components
│   │   │   ├── server.ts        # Supabase client for server components
│   │   │   └── middleware.ts    # Auth middleware
│   │   │
│   │   ├── ai/
│   │   │   ├── client.ts        # Vercel AI SDK setup
│   │   │   ├── prompts/         # LLM prompt templates
│   │   │   │   ├── analyze-decision.ts
│   │   │   │   └── index.ts
│   │   │   └── parser.ts        # Parse LLM structured output
│   │   │
│   │   └── utils/
│   │       ├── cn.ts            # Classname utility
│   │       ├── date.ts          # Date formatting
│   │       └── validation.ts    # Form validation schemas
│   │
│   ├── actions/                 # Server Actions
│   │   ├── auth.ts              # Auth actions
│   │   ├── decisions.ts         # Decision CRUD actions
│   │   └── analysis.ts          # LLM analysis actions
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDecisions.ts
│   │   ├── usePolling.ts
│   │   └── useToast.ts
│   │
│   ├── types/
│   │   ├── database.ts          # Prisma type exports
│   │   ├── api.ts               # API response types
│   │   └── index.ts
│   │
│   └── constants/
│       ├── routes.ts
│       └── config.ts
│
└── tests/                       # Tests (future)
    └── .gitkeep
```

---

## Key Technical Flows

### 1. User Authentication Flow

```typescript
// Step 1: User clicks "Sign in with Google"
// components/auth/OAuthButtons.tsx
import { createClientComponentClient } from '@supabase/ssr';

const supabase = createClientComponentClient();

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

// Step 2: Callback route handles OAuth redirect
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/decisions', request.url));
}

// Step 3: Middleware protects routes
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith('/decisions')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}
```

### 2. Real-Time Updates with Server-Sent Events (SSE)

```typescript
// Server-Side Polling (every 10 seconds)
// app/api/decisions/stream/route.ts
export async function GET(request: NextRequest) {
  // Authenticate user
  const supabase = await createClient();
  const { user } = await supabase.auth.getUser();

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const checkPendingDecisions = async () => {
        // Query database for pending decisions
        const pendingDecisions = await prisma.decision.findMany({
          where: { userId: user.id, status: { in: ['PENDING', 'PROCESSING'] } },
        });

        // Send all decisions to client
        const allDecisions = await prisma.decision.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });

        // Push update via SSE
        controller.enqueue(
          `data: ${JSON.stringify({
            type: 'update',
            decisions: allDecisions,
          })}\n\n`
        );
      };

      // Poll every 10 seconds
      await checkPendingDecisions();
      const intervalId = setInterval(checkPendingDecisions, 10000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// Client-Side Hook
// hooks/useDecisionStream.ts
export function useDecisionStream() {
  const [decisions, setDecisions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/decisions/stream');

    eventSource.onopen = () => setIsConnected(true);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        setDecisions(data.decisions);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      // Reconnect with exponential backoff
    };

    return () => eventSource.close();
  }, []);

  return { decisions, isConnected };
}
```

### 3. Decision Creation & Analysis Flow

```typescript
// Step 1: User submits decision form
// components/decisions/DecisionForm.tsx
'use client'

import { createDecision, analyzeDecision } from '@/actions/decisions'

async function handleSubmit(data: FormData) {
  // Create decision (status: PENDING)
  const decision = await createDecision({
    situation: data.get('situation'),
    decision: data.get('decision'),
    reasoning: data.get('reasoning')
  })

  // Redirect to decision detail page (shows "processing" status)
  router.push(`/decisions/${decision.id}`)

  // Trigger analysis in background (non-blocking)
  analyzeDecision(decision.id).catch(console.error)
}

// Step 2: Server Action handles analysis
// actions/analysis.ts
'use server'

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { prisma } from '@/lib/prisma'
import { analysisPrompt } from '@/lib/ai/prompts'

export async function analyzeDecision(decisionId: string) {
  // Update status to PROCESSING
  await prisma.decision.update({
    where: { id: decisionId },
    data: { status: 'PROCESSING' }
  })

  try {
    // Get decision data
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId }
    })

    // Call LLM with structured output
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: analysisSchema,
      prompt: analysisPrompt(decision)
    })

    // Update decision with analysis
    await prisma.decision.update({
      where: { id: decisionId },
      data: {
        status: 'COMPLETED',
        category: object.category,
        biases: object.biases,
        alternatives: object.alternatives,
        insights: object.insights,
        lastAnalyzedAt: new Date()
      }
    })
  } catch (error) {
    // Handle failure
    await prisma.decision.update({
      where: { id: decisionId },
      data: {
        status: 'FAILED',
        errorMessage: error.message,
        analysisAttempts: { increment: 1 }
      }
    })
  }
}

// Step 3: Client polls for updates
// components/decisions/DecisionDetail.tsx
'use client'

import { usePolling } from '@/hooks/usePolling'

function DecisionDetail({ initialDecision }) {
  const { data: decision } = usePolling(
    `/api/decisions/${initialDecision.id}`,
    {
      enabled: initialDecision.status === 'PENDING' || initialDecision.status === 'PROCESSING',
      interval: 3000 // Poll every 3 seconds
    }
  )

  if (decision.status === 'COMPLETED') {
    return <AnalysisDisplay analysis={decision} />
  }

  return <LoadingSkeleton />
}
```

### 3. Re-analysis Flow

```typescript
// components/decisions/ReAnalyzeButton.tsx
'use client'

import { reanalyzeDecision } from '@/actions/analysis'

async function handleReAnalyze(decisionId: string) {
  await reanalyzeDecision(decisionId)
  // Polling hook will pick up status change
}

// actions/analysis.ts
export async function reanalyzeDecision(decisionId: string) {
  // Reset status and increment attempts
  await prisma.decision.update({
    where: { id: decisionId },
    data: {
      status: 'PENDING',
      analysisAttempts: { increment: 1 }
    }
  })

  // Trigger new analysis
  return analyzeDecision(decisionId)
}
```

### 4. User Menu with Avatar & Theme Toggle

```typescript
// Step 1: Server Action retrieves current user data
// actions/auth.ts
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get additional user data from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
    },
  });

  return {
    id: user.id,
    email: user.email || dbUser?.email || '',
    name: dbUser?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    avatarUrl: dbUser?.avatarUrl || user.user_metadata?.avatar_url || null,
  };
}

// Step 2: UserMenu component displays avatar and dropdown
// components/layout/UserMenu.tsx
'use client';

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <MenuRoot positioning={{ placement: 'bottom-end' }}>
      <MenuTrigger asChild>
        <IconButton variant="ghost" size="sm" aria-label="User menu">
          <Avatar.Root size="sm">
            <Avatar.Fallback name={user.name} />
            {user.avatarUrl && <Avatar.Image src={user.avatarUrl} />}
          </Avatar.Root>
        </IconButton>
      </MenuTrigger>

      <MenuContent>
        {/* User Info */}
        <MenuItem closeOnSelect={false}>
          <Avatar.Root size="md">
            <Avatar.Fallback name={user.name} />
            {user.avatarUrl && <Avatar.Image src={user.avatarUrl} />}
          </Avatar.Root>
          <Text>{user.name}</Text>
          <Text>{user.email}</Text>
        </MenuItem>

        {/* Theme Toggle (stays open on click) */}
        <MenuItem onClick={toggleColorMode} closeOnSelect={false}>
          {colorMode === 'dark' ? <LuSun /> : <LuMoon />}
          <Text>{colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</Text>
        </MenuItem>

        {/* Sign Out */}
        <MenuItem onClick={onSignOut}>
          <LuLogOut />
          <Text>Sign Out</Text>
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}

// Step 3: DecisionsPage fetches user and renders menu
// app/(dashboard)/decisions/page.tsx
'use client';

export default function DecisionsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (userData) {
        setUser(userData);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Box>
      <Stack direction="row" justify="space-between">
        <Heading>Your Decisions</Heading>
        <Stack direction="row" gap={2}>
          <DecisionFormModal />
          {user && <UserMenu user={user} onSignOut={handleSignOut} />}
        </Stack>
      </Stack>
    </Box>
  );
}
```

### 5. Sorting & Filtering Architecture (Future-Ready)

```typescript
// actions/decisions.ts
export async function getDecisions({
  userId,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  filterBy = {},
  page = 1,
  limit = 20,
}: GetDecisionsParams) {
  return prisma.decision.findMany({
    where: {
      userId,
      // Future: add filter conditions
      ...(filterBy.status && { status: filterBy.status }),
      ...(filterBy.category && { category: filterBy.category }),
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

---

## Environment Setup

### Required Environment Variables

Create `.env.local` file:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY="[YOUR_API_KEY]"

# App URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Production: https://retrospecta.vercel.app
```

### Setup Instructions

1. **Supabase Project Setup:**

   ```bash
   # 1. Go to https://supabase.com/dashboard
   # 2. Create new project: "retrospecta"
   # 3. Get DATABASE_URL from Settings > Database
   # 4. Enable Google OAuth in Authentication > Providers
   # 5. Copy keys to .env.local
   ```

2. **Google AI Studio API Key:**

   ```bash
   # 1. Go to https://aistudio.google.com/
   # 2. Create API key
   # 3. Copy to .env.local
   ```

3. **Google OAuth Setup (Supabase):**

   ```bash
   # 1. Go to Google Cloud Console
   # 2. Create OAuth 2.0 Client ID
   # 3. Add authorized redirect URI:
   #    https://[PROJECT_ID].supabase.co/auth/v1/callback
   # 4. Copy Client ID & Secret to Supabase dashboard
   ```

4. **Install Dependencies:**

   ```bash
   npm install
   ```

5. **Run Database Migrations:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## Deployment Strategy

### Vercel Deployment

#### Initial Setup

1. **Connect GitHub Repository:**

   ```bash
   # Push to GitHub
   git remote add origin https://github.com/[username]/retrospecta.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import `retrospecta` repository
   - Project name: `retrospecta`
   - Framework: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`

3. **Configure Environment Variables:**
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to production URL

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Test at `https://retrospecta.vercel.app`

#### Continuous Deployment

- **Auto-deploy:** Every push to `main` branch triggers deployment
- **Preview deployments:** Pull requests get preview URLs
- **Rollback:** One-click rollback in Vercel dashboard

#### Post-Deployment Verification

- [ ] Test OAuth login (Google)
- [ ] Create test decision
- [ ] Verify LLM analysis works
- [ ] Test dark theme toggle
- [ ] Check mobile responsiveness
- [ ] Verify sorting functionality

---

## Git Workflow

### Conventional Commits

Use the following prefixes:

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting)
refactor: Code refactoring
test:     Adding tests
chore:    Build process or auxiliary tool changes
```

### Examples:

```bash
git commit -m "feat: add decision creation form"
git commit -m "feat: integrate Google Gemini for analysis"
git commit -m "fix: resolve OAuth redirect loop"
git commit -m "style: format code with prettier"
git commit -m "docs: update README with setup instructions"
```

### Branch Strategy

- **main:** Production-ready code (auto-deploys to Vercel)
- **dev:** Development branch (optional for this project)
- **feature/\*:** Feature branches (optional for solo development)

For a 2-day solo project, committing directly to `main` is acceptable.

---

## Future Enhancements

### Phase 5: Analytics Dashboard (Post-MVP)

**Estimated Time:** 4-6 hours

#### Features:

- Decision type distribution (pie chart)
- Bias frequency over time (bar chart)
- Decision-making patterns timeline
- Most common biases identified

#### Implementation:

```typescript
// New page: app/(dashboard)/analytics/page.tsx
// Use Recharts or similar library
// Aggregate data from Prisma queries

const stats = await prisma.decision.groupBy({
  by: ['category'],
  _count: { category: true },
  where: { userId, status: 'COMPLETED' },
});
```

### Phase 6: Advanced Filtering (Post-MVP)

**Estimated Time:** 2-3 hours

#### Features:

- Filter by decision category
- Filter by specific biases
- Date range filtering
- Multi-select filters

#### Implementation:

```typescript
// Extend existing getDecisions action
// Add filter UI components
// Use Chakra UI Select/MultiSelect components
```

### Phase 7: Enhanced LLM Features

**Estimated Time:** 3-4 hours

#### Features:

- Follow-up questions to clarify decisions
- Comparative analysis (compare two decisions)
- Decision quality score (0-100)
- Personalized recommendations based on history

### Phase 8: Collaboration Features

**Estimated Time:** 8-10 hours

#### Features:

- Share decisions with specific users
- Request peer feedback
- Group decision-making mode
- Comments on decisions

### Phase 9: Internationalization

**Estimated Time:** 2-3 hours (if architecture followed)

#### Implementation:

```typescript
// 1. Add locale parameter to LLM prompts
// 2. Use next-intl or similar library
// 3. Translate UI strings
// 4. Support multiple analysis languages

// lib/ai/prompts/analyze-decision.ts
export const analysisPrompt = (decision, locale = 'en') => {
  const prompts = {
    en: 'Analyze this decision...',
    uk: 'Проаналізуйте це рішення...',
  };
  return prompts[locale];
};
```

### Phase 10: Mobile App

**Estimated Time:** 2-3 weeks

#### Technology:

- React Native with Expo
- Share API routes with web app
- Native mobile experience

---

## Success Criteria

### MVP Success (End of Day 2):

- ✅ User can register and log in (email + Google OAuth)
- ✅ User can create decisions with situation/decision/reasoning
- ✅ LLM analyzes decisions and returns structured insights
- ✅ User sees decision history with analysis results
- ✅ Status indicators show processing state (with SSE real-time updates)
- ✅ Dark theme works correctly (integrated in user menu)
- ✅ User profile dropdown with avatar display
- ✅ Theme toggle and logout in user menu
- ⏳ Sorting by date/status works - In Progress
- ⏳ Re-analysis feature functional - Planned
- ⏳ Deployed to Vercel with working demo - Planned
- ✅ Clean, professional UI with skeleton loading states
- ⏳ Comprehensive README with setup instructions - Planned

### Bonus Points:

- Responsive mobile design
- Excellent error handling
- Smooth animations/transitions
- Accessibility best practices
- Well-documented code
- Clean git history with conventional commits

---

## Risk Mitigation

### Potential Risks & Solutions:

1. **LLM API Rate Limits**
   - Solution: Implement rate limiting on client side
   - Fallback: Queue system for high traffic

2. **Supabase Free Tier Limits**
   - Solution: Monitor usage in dashboard
   - Limit: 500MB DB, 50K MAUs (sufficient for demo)

3. **OAuth Configuration Issues**
   - Solution: Detailed documentation, test early
   - Fallback: Email/password auth works independently

4. **Deployment Issues**
   - Solution: Test deployment early on Day 2
   - Use Vercel's preview deployments for testing

5. **Time Management**
   - Solution: Prioritize core features, skip nice-to-haves
   - Focus on working demo over perfect code

---

## Resources & Documentation

### Official Documentation:

- Next.js 16: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Prisma: https://www.prisma.io/docs
- Chakra UI: https://www.chakra-ui.com/docs
- Vercel AI SDK: https://sdk.vercel.ai/docs
- Google Gemini: https://ai.google.dev/docs

### Helpful Guides:

- Supabase Auth with Next.js: https://supabase.com/docs/guides/auth/server-side/nextjs
- Prisma with Next.js: https://www.prisma.io/nextjs
- Vercel AI SDK Examples: https://github.com/vercel/ai

---

## Conclusion

This technical documentation provides a comprehensive blueprint for building **Retrospecta** within the 2-day timeline. The architecture is designed to be:

- **Fast to implement:** Clear phases with time estimates
- **Production-ready:** Real auth, database, error handling
- **Extensible:** Ready for filters, dashboard, i18n
- **Professional:** Clean code, type-safe, well-structured

The tech stack choices prioritize developer experience and rapid development while maintaining code quality and scalability.

**Next Steps:**

1. Review this document
2. Setup development environment
3. Begin Phase 1: Foundation
4. Follow implementation phases sequentially

---

**Document Version:** 1.0
**Last Updated:** 2025-10-25
**Author:** Technical Planning Session
**Status:** Ready for Implementation
