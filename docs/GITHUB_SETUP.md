# GitHub Repository Setup Guide

This guide covers setting up the GitHub repository with proper branch protection and team configuration.

---

## 1. Repository Settings

### General Settings

1. Go to **Settings → General**
2. Set the default branch to `main`
3. Under **Features**, enable:
   - Issues
   - Projects
   - Discussions (optional)

---

## 2. Branch Setup

Create the following branches in order:

```bash
# Make sure you're on main
git checkout main

# Create and push the dev branch
git checkout -b dev
git push -u origin dev

# Return to main
git checkout main
```

---

## 3. Branch Protection Rules

### Protect `main`

1. Go to **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
     - ✅ Require approvals: **1**
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict who can push to matching branches
     - Add only the **team lead**

### Protect `dev`

1. Add another rule for `dev`
2. Enable:
   - ✅ Require a pull request before merging
     - ✅ Require approvals: **1**
   - ✅ Require branches to be up to date before merging

---

## 4. Team Collaboration

### Add Collaborators

1. Go to **Settings → Collaborators**
2. Add team members with **Write** access

### CODEOWNERS (Optional)

Create `.github/CODEOWNERS` to auto-assign reviewers:

```
# Frontend
src/components/ @frontend-dev-username
src/app/globals.css @frontend-dev-username

# Backend
supabase/ @backend-dev-username
src/lib/supabase/ @backend-dev-username
src/middleware.ts @backend-dev-username

# Full-stack
src/app/(app)/ @fullstack-dev-username
```

---

## 5. Labels

Create these labels for issues and PRs:

| Label | Color | Description |
|-------|-------|-------------|
| `feat` | `#0E8A16` | New feature |
| `fix` | `#D93F0B` | Bug fix |
| `docs` | `#0075CA` | Documentation |
| `ui` | `#7057FF` | Frontend/UI |
| `api` | `#E4E669` | Backend/API |
| `priority: high` | `#B60205` | High priority |
| `priority: medium` | `#FBCA04` | Medium priority |
| `priority: low` | `#0E8A16` | Low priority |

---

## 6. PR Template

A pull request template is already included at `.github/pull_request_template.md`. It will automatically populate when team members create PRs.

---

## 7. Development Workflow

```
1. Pull latest from dev
   git checkout dev && git pull

2. Create your feature branch
   git checkout -b feat/ui-my-feature

3. Make changes and commit
   git add .
   git commit -m "feat: add task filtering UI"

4. Push and create PR
   git push -u origin feat/ui-my-feature
   → Open PR targeting 'dev' on GitHub

5. Get review and merge
   → Team member reviews and approves
   → Merge PR and delete branch
```
