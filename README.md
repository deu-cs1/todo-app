# Orbitask - Team Todo App MVP

Todoist-inspired team task management MVP with multi-assignee tasks and independent per-user assignment status.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix Dialog primitives
- Convex database and Convex Auth

## Run

```bash
npm install
npx convex dev
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
- Password-based sign-up/sign-in via Convex Auth

This project is currently configured for a local anonymous Convex deployment:

- Convex backend: `http://127.0.0.1:3210`
- Local dashboard: `http://127.0.0.1:6790`
- Cloud dashboard: not connected unless you link the app to a Convex account/project

The app does not seed demo data automatically. To clear the local development database:

```bash
npx convex run dev:clearAllData
```

## Convex Cloud Dashboard

The current `.env.local` uses an anonymous local deployment:

```env
CONVEX_DEPLOYMENT=anonymous:anonymous-todoapp
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

Anonymous local deployments do not appear as normal projects in the Convex web dashboard. To manage the project from `dashboard.convex.dev`, link this app to a Convex cloud project:

```bash
npx convex login
npx convex dev
```

When prompted, create a new project or select an existing project. Convex will update `.env.local` with a cloud deployment name and a `NEXT_PUBLIC_CONVEX_URL` like:

```env
CONVEX_DEPLOYMENT=dev:your-project-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

After that, the project and its dev deployment will be visible in the Convex web dashboard. Local anonymous data and cloud data are separate databases, so data created in the local backend will not automatically appear in the cloud project.
