# Orbitask - Team Todo App MVP

Todoist-inspired team task management MVP with multi-assignee tasks and independent per-user assignment status.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix Dialog primitives
- Convex schema and function scaffold

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current state

- High-conversion landing page at `/`
- Auth entry pages at `/sign-in` and `/sign-up`
- App shell with sidebar navigation
- My Tasks, Today, Upcoming, Team, Project, Members, Settings, and Invite routes
- Reusable task/member UI components
- Convex schema plus authorization-minded query/mutation scaffolding

Convex needs project configuration before codegen:

```bash
npx convex dev
```
