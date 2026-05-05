# SyncPal

> **Where development teams stay in flow.**

A lightweight project management platform designed for small, fast-moving development teams. SyncPal combines task management, Git branch tracking, and workflow visibility into a single streamlined workspace.

Built by developers, for developers.

---

## ✨ Features

- **Dashboard** — Key metrics at a glance: active branches, PRs ready for merge, completed tasks, rework count
- **Kanban Boards** — Drag-and-drop task management with real-time status tracking
- **My Tasks** — Personal workspace showing all assigned tasks across boards
- **Authentication** — GitHub OAuth, Google OAuth, and email/password login
- **Admin Panel** — Role-based access control (Admin/User) with user management
- **Dark Mode** — Beautiful light and dark themes with system preference detection
- **Activity Logging** — Track all team actions for transparency and accountability

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [Next.js](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Backend | [Supabase](https://supabase.com/) (PostgreSQL, Auth, APIs) |
| Drag & Drop | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) |
| Deployment | [Vercel](https://vercel.com/) (Frontend) + Supabase (Backend) |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [Supabase](https://supabase.com/) account (free tier works)
- A [GitHub](https://github.com/) account (for OAuth)
- A [Google Cloud](https://console.cloud.google.com/) account (for OAuth, optional)

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone git@github.com:cristianjohnn/SyncPal.git
cd SyncPal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Set up the database

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Run the SQL to create all tables, indexes, and RLS policies

### 5. Configure authentication providers

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for detailed instructions on setting up:
- GitHub OAuth
- Google OAuth
- Email/Password authentication

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
syncpal/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages (login, signup)
│   │   ├── (app)/            # Authenticated app pages
│   │   │   ├── dashboard/    # Dashboard with metrics
│   │   │   ├── boards/       # Board list + Kanban view
│   │   │   ├── tasks/        # My Tasks workspace
│   │   │   ├── admin/users/  # User management (admin only)
│   │   │   └── settings/     # Profile & preferences
│   │   └── auth/callback/    # OAuth callback handler
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Sidebar, Header, AppShell
│   │   ├── shared/           # Theme toggle, Empty state, Skeletons
│   │   ├── dashboard/        # Dashboard content
│   │   ├── boards/           # Kanban board, Task card, Task dialog
│   │   ├── tasks/            # My Tasks view
│   │   ├── admin/            # Admin user management
│   │   └── settings/         # Settings form
│   ├── lib/
│   │   ├── supabase/         # Supabase client (browser, server, middleware)
│   │   ├── utils.ts          # Utility functions
│   │   └── activity.ts       # Activity logging helper
│   └── types/
│       └── database.ts       # TypeScript type definitions
├── supabase/
│   └── schema.sql            # Complete database schema with RLS
├── docs/
│   ├── SETUP_GUIDE.md        # Per-role setup instructions
│   └── GITHUB_SETUP.md       # Repository & branch protection guide
└── .github/
    └── pull_request_template.md
```

---

## 🗄 Database Schema

| Table | Description |
|-------|------------|
| `users` | Team member profiles with roles (admin/user) |
| `boards` | Project boards for organizing tasks |
| `tasks` | Individual work items with status, priority, and assignee |
| `branches` | Git branch tracking linked to tasks |
| `activity_log` | Audit trail of all team actions |

---

## 👥 Contributing

### Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production (managed by team lead) |
| `dev` | Integration branch |
| `feat/ui-*` | Frontend features |
| `feat/api-*` | Backend and database |
| `feat/flow-*` | Full-stack integration |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation |

### Commit Message Format

```
feat: short description
fix: short description
docs: short description
refactor: short description
style: short description
```

### Pull Request Rules

1. Always open PR to `dev`
2. Never push directly to `main`
3. Include a clear description of changes
4. At least one reviewer must approve
5. Delete branch after merge

---

## 📄 License

This project is proprietary software. All rights reserved.
