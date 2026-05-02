# Synqr — Setup Guide

This guide provides step-by-step instructions for each team role to get started with the Synqr project.

---

## Prerequisites (All Roles)

1. **Node.js** v18+ installed — [Download](https://nodejs.org/)
2. **Git** installed and configured
3. **VS Code** (recommended) with extensions:
   - ESLint
   - Tailwind CSS IntelliSense
   - Prettier
4. Access to the GitHub repository

---

## 1. Supabase Project Setup (Backend Developer)

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `synqr`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose the closest to your team
4. Click **"Create new project"** and wait for provisioning (~2 minutes)

### Get Your API Keys

1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Run the Database Schema

1. Go to **SQL Editor** in the Supabase Dashboard
2. Click **"New query"**
3. Paste the entire contents of `supabase/schema.sql`
4. Click **"Run"**
5. Verify all tables were created under **Table Editor**

### Configure GitHub OAuth

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `Synqr`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
     _(Get this URL from Supabase → Authentication → Providers → GitHub)_
4. Click **"Register application"**
5. Copy the **Client ID**
6. Generate a **Client Secret** and copy it
7. In Supabase Dashboard → **Authentication → Providers → GitHub**:
   - Toggle **Enable**
   - Paste your **Client ID** and **Client Secret**
   - Click **Save**

### Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services → Credentials**
4. Click **"Create Credentials" → "OAuth client ID"**
5. If prompted, configure the **OAuth consent screen** first:
   - User Type: External
   - App name: `Synqr`
   - Support email: your email
   - Authorized domains: `supabase.co`
6. Create the OAuth client:
   - Application type: **Web application**
   - Name: `Synqr`
   - Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**
8. In Supabase Dashboard → **Authentication → Providers → Google**:
   - Toggle **Enable**
   - Paste your **Client ID** and **Client Secret**
   - Click **Save**

### Configure Email/Password Auth

1. In Supabase → **Authentication → Providers → Email**
2. Ensure **Enable Email provider** is toggled on
3. Optionally disable **Confirm email** for development

---

## 2. Frontend Developer Setup

### Clone and Install

```bash
git clone git@github.com:cristianjohnn/SynQR.git
cd SynQR
npm install
```

### Environment Variables

```bash
cp .env.local.example .env.local
```

Ask the Backend Developer for the Supabase credentials and fill in `.env.local`.

### Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Your Branch Prefix

```
feat/ui-*
```

Example: `feat/ui-dashboard-redesign`, `feat/ui-kanban-animations`

### Key Files You'll Work On

- `src/app/(app)/` — Page components
- `src/components/` — Reusable components
- `src/app/globals.css` — Design system tokens and custom styles

---

## 3. Backend Developer Setup

### Your Branch Prefix

```
feat/api-*
```

Example: `feat/api-rls-policies`, `feat/api-auth-flow`

### Key Files You'll Work On

- `supabase/schema.sql` — Database schema and RLS policies
- `src/lib/supabase/` — Supabase client configuration
- `src/app/auth/` — Authentication callback handlers
- `src/middleware.ts` — Route protection

### Supabase CLI (Optional)

For local development with the Supabase CLI:

```bash
npm install -g supabase
supabase init
supabase start
```

---

## 4. Full-Stack Developer Setup

### Your Branch Prefix

```
feat/flow-*
```

Example: `feat/flow-task-crud`, `feat/flow-activity-logging`

### Key Files You'll Work On

- Everything — you bridge frontend and backend
- `src/app/(app)/` — Server components with data fetching
- `src/components/` — Client components with mutations
- `src/lib/activity.ts` — Activity logging

---

## 5. QA / Documentation Setup

### Your Branch Prefix

```
fix/* or docs/*
```

Example: `fix/login-redirect`, `docs/readme-update`

### Key Responsibilities

- Test all user flows (login, board creation, task management)
- File issues with clear reproduction steps
- Update documentation as features evolve
- Help with deployment configuration

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm start` | Start production server |
