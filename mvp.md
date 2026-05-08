# MVP Spec & Build Prompt — Team Todo App

## 1. Role for the AI Agent

You are an expert full-stack product engineer. Build a production-minded MVP for a Todoist-inspired team task management web app.

The product should feel fast, minimal, calm, and focused. Do not copy Todoist branding, logos, exact UI, names, assets, or proprietary visuals. Use Todoist as product inspiration only: simple task creation, clean sidebar navigation, fast assignment flow, project/team organization, and a distraction-free interface.

## 2. Product Summary

Build a web app where users can:

- Create teams/workspaces.
- Invite users to teams.
- Create projects inside teams.
- Create tasks inside team projects.
- Assign each task to one or more specific team members.
- Let only the assigned user update their own assignment status.
- Track per-user task status: `todo`, `in_progress`, `completed`.
- See personal assigned tasks in a `My Tasks` view.
- See team/project tasks if the user has permission.

The key product difference from Todoist: this app supports multi-assignee tasks, and each assignee has their own independent status on the same task.

Example:

> Task: “Prepare launch landing page”  
> Assigned to: Ayşe, Mehmet, Zeynep  
> Ayşe: completed  
> Mehmet: in_progress  
> Zeynep: todo  
> Overall task status is derived from assignment statuses.

## 3. Tech Stack

Use this stack unless there is a strong reason not to:

- Frontend: Next.js with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui or a clean custom component system
- Backend/database: Convex
- Auth: Convex Auth, Clerk + Convex, or another Convex-compatible auth setup
- Deployment target: Vercel for frontend + Convex deployment

The implementation must be type-safe, cleanly organized, and easy to extend.

## 4. Core UX Direction

The app should have a minimal productivity-app design:

- Left sidebar with teams, projects, and navigation.
- Main task list area.
- Quick task creation input.
- Task detail drawer or modal.
- Assignee chips with avatars/initials.
- Status chips: `Todo`, `Doing`, `Done`.
- Due date and priority shown subtly.
- Clear empty states.
- Responsive layout for desktop-first MVP, with reasonable mobile support.

Design principles:

- Calm, clean, whitespace-heavy interface.
- Avoid visual clutter.
- Use subtle borders, soft shadows, and rounded corners.
- Prioritize readability and fast task entry.
- Use keyboard-friendly forms where possible.
- Avoid overengineering animations.

## 5. MVP Scope

### Must Have

1. Authentication
   - Users can sign up, sign in, and sign out.
   - Each authenticated user has a profile.

2. Team Management
   - A user can create a team.
   - Team creator becomes `owner`.
   - Team roles: `owner`, `admin`, `member`.
   - Owner/admin can invite users.
   - Owner/admin can remove members.
   - Member list is visible to team members.

3. Invitations
   - Owner/admin can invite a user by email.
   - MVP can use either:
     - email-based invite delivery, or
     - generated invite link copied manually.
   - Invite has status: `pending`, `accepted`, `revoked`, `expired`.
   - Invite has expiration timestamp.
   - A user can accept an invite after signing in.

4. Projects
   - Team members can view projects they have access to.
   - Owner/admin can create, rename, archive, and delete projects.
   - Members can create tasks in projects if allowed by role policy.
   - Project list appears in the sidebar.

5. Tasks
   - A team member can create a task inside a project.
   - Task fields:
     - title
     - description
     - project
     - optional section
     - due date
     - priority: `low`, `medium`, `high`
     - createdBy
     - createdAt
     - updatedAt
   - Task creator can assign the task to one or more team members.
   - Owner/admin can edit any task in their team.
   - Creator can edit their own task.
   - Assigned users can view the task.

6. Assignment Logic
   - A task may have one or more assignees.
   - Each assignment is stored separately.
   - Each assignment has its own status:
     - `todo`
     - `in_progress`
     - `completed`
   - Only the assigned user can update their own assignment status.
   - Task creator, owner, and admin can change assignees but cannot mark another user's assignment as completed unless explicitly implementing an admin override with audit logging.
   - If all assignments are `completed`, the task is considered completed overall.
   - If at least one assignment is `in_progress`, the task is considered in progress overall.
   - If no one has started, the task is considered todo overall.

7. Views
   - `Inbox` or `My Tasks`: tasks assigned to the current user.
   - `Today`: tasks assigned to the current user and due today.
   - `Upcoming`: tasks assigned to the current user with future due dates.
   - `Team Projects`: project-based task lists.
   - `Team Members`: list of members and roles.

8. Realtime Updates
   - Use Convex reactive queries so changes appear without manual refresh.
   - When a user changes their status, other authorized viewers see the update live.

9. Authorization
   - Every Convex query and mutation must validate the authenticated user.
   - Never trust a user ID sent from the client as the source of identity.
   - Always derive the current user from auth context.
   - Check team membership before reading or writing team data.
   - Enforce role permissions on the server, not only in the UI.

### Nice to Have, But Not Required for MVP

- Comments on tasks.
- Activity log.
- Labels/tags.
- Recurring tasks.
- File attachments.
- Notifications.
- Email reminders.
- Calendar view.
- Drag-and-drop board view.
- Advanced filters.
- Search.

Do not build these unless the core MVP is complete.

## 6. Recommended Information Architecture

Sidebar:

- My Tasks
- Today
- Upcoming
- Teams
  - Current Team Name
    - Projects
      - Project A
      - Project B
    - Members
    - Settings

Main area examples:

- My Tasks page: grouped by status or due date.
- Project page: grouped by sections or status.
- Task detail drawer: title, description, assignees, due date, priority, assignment statuses.

## 7. Data Model for Convex

Design the Convex schema around separate documents for teams, memberships, invites, projects, tasks, and task assignments.

### `profiles`

Use this table if the auth provider does not already provide all required user fields.

Fields:

- `userId`: auth user id / Convex user id reference
- `name`: string
- `email`: string
- `avatarUrl`: optional string
- `createdAt`: number
- `updatedAt`: number

Indexes:

- `by_userId`
- `by_email`

### `teams`

Fields:

- `name`: string
- `slug`: string
- `ownerId`: user id
- `createdAt`: number
- `updatedAt`: number
- `archivedAt`: optional number

Indexes:

- `by_ownerId`
- `by_slug`

### `teamMembers`

Fields:

- `teamId`: id of `teams`
- `userId`: user id
- `role`: `owner` | `admin` | `member`
- `status`: `active` | `removed`
- `joinedAt`: number
- `removedAt`: optional number

Indexes:

- `by_teamId`
- `by_userId`
- `by_teamId_and_userId`
- `by_teamId_and_status`

### `teamInvites`

Fields:

- `teamId`: id of `teams`
- `email`: string
- `role`: `admin` | `member`
- `tokenHash`: string
- `status`: `pending` | `accepted` | `revoked` | `expired`
- `invitedById`: user id
- `acceptedById`: optional user id
- `createdAt`: number
- `expiresAt`: number
- `acceptedAt`: optional number

Indexes:

- `by_teamId`
- `by_email`
- `by_tokenHash`
- `by_teamId_and_email`

### `projects`

Fields:

- `teamId`: id of `teams`
- `name`: string
- `description`: optional string
- `color`: optional string
- `createdById`: user id
- `archivedAt`: optional number
- `createdAt`: number
- `updatedAt`: number

Indexes:

- `by_teamId`
- `by_teamId_and_archivedAt`

### `sections`

Optional but useful for Todoist-like organization.

Fields:

- `teamId`: id of `teams`
- `projectId`: id of `projects`
- `name`: string
- `order`: number
- `createdAt`: number
- `updatedAt`: number

Indexes:

- `by_projectId`
- `by_projectId_and_order`

### `tasks`

Fields:

- `teamId`: id of `teams`
- `projectId`: id of `projects`
- `sectionId`: optional id of `sections`
- `title`: string
- `description`: optional string
- `createdById`: user id
- `dueDate`: optional number
- `priority`: `low` | `medium` | `high`
- `archivedAt`: optional number
- `createdAt`: number
- `updatedAt`: number

Do not store a single `assigneeId` on the task. Use `taskAssignments` instead.

Indexes:

- `by_teamId`
- `by_projectId`
- `by_createdById`
- `by_dueDate`
- `by_projectId_and_archivedAt`

### `taskAssignments`

Fields:

- `taskId`: id of `tasks`
- `teamId`: id of `teams`
- `projectId`: id of `projects`
- `userId`: assigned user id
- `assignedById`: user id
- `status`: `todo` | `in_progress` | `completed`
- `createdAt`: number
- `updatedAt`: number
- `completedAt`: optional number

Indexes:

- `by_taskId`
- `by_userId`
- `by_teamId_and_userId`
- `by_projectId_and_userId`
- `by_taskId_and_userId`
- `by_status`

Important rule:

- There must not be duplicate assignments for the same `taskId + userId`.

### `activityLog` — Optional

Useful for debugging and future product features.

Fields:

- `teamId`: id of `teams`
- `actorId`: user id
- `entityType`: `team` | `project` | `task` | `assignment` | `invite`
- `entityId`: string
- `action`: string
- `metadata`: optional object
- `createdAt`: number

Indexes:

- `by_teamId`
- `by_actorId`
- `by_entityId`

## 8. Convex Function Requirements

Create Convex functions for the following areas.

### Auth/Profile

- `getCurrentUser`
- `upsertProfile`
- `getMyProfile`

### Teams

- `createTeam(name)`
- `listMyTeams()`
- `getTeam(teamId)`
- `updateTeam(teamId, patch)`
- `removeTeamMember(teamId, userId)`
- `changeMemberRole(teamId, userId, role)`

### Invites

- `createTeamInvite(teamId, email, role)`
- `listTeamInvites(teamId)`
- `revokeInvite(inviteId)`
- `acceptInvite(token)`

Implementation notes:

- Store only a hashed invite token in the database.
- Show the plain invite token/link only at creation time.
- Check expiration before accepting.
- Check that the accepting user's email matches the invite email unless using open invite links intentionally.

### Projects

- `createProject(teamId, name, description?)`
- `listTeamProjects(teamId)`
- `updateProject(projectId, patch)`
- `archiveProject(projectId)`

### Tasks

- `createTask({ teamId, projectId, sectionId?, title, description?, dueDate?, priority, assigneeIds })`
- `listProjectTasks(projectId)`
- `listMyTasks(teamId?)`
- `listTodayTasks()`
- `listUpcomingTasks()`
- `getTaskWithAssignments(taskId)`
- `updateTask(taskId, patch)`
- `archiveTask(taskId)`
- `setTaskAssignees(taskId, assigneeIds)`
- `updateMyAssignmentStatus(taskId, status)`

Important mutation behavior:

- `createTask` must validate that every assignee is an active member of the task's team.
- `setTaskAssignees` must add missing assignments and remove assignments that are no longer selected.
- `updateMyAssignmentStatus` must only update the assignment where `assignment.userId === currentUserId`.
- Do not allow a non-assigned user to mark a task as completed or in progress.

## 9. Authorization Rules

Use helper functions in Convex such as:

- `requireCurrentUser(ctx)`
- `requireTeamMember(ctx, teamId)`
- `requireTeamAdminOrOwner(ctx, teamId)`
- `canEditTask(ctx, task)`
- `canViewTask(ctx, task)`
- `requireTaskAssignee(ctx, taskId)`

Rules:

1. A user can list only teams where they are an active member.
2. A user can list only projects in teams where they are an active member.
3. A user can view a task if:
   - they are assigned to it, or
   - they created it, or
   - they are owner/admin of the team.
4. A user can edit task content if:
   - they created it, or
   - they are owner/admin of the team.
5. A user can update assignment status only for their own assignment.
6. A user can invite/remove/change roles only if they are owner/admin.
7. Owner cannot be removed unless ownership is transferred first.

## 10. Task Status Logic

Do not store an unreliable global task status unless needed for performance. Prefer deriving it from assignments.

Derived status rules:

```ts
type AssignmentStatus = "todo" | "in_progress" | "completed";
type DerivedTaskStatus = "todo" | "in_progress" | "completed";

function deriveTaskStatus(assignments: { status: AssignmentStatus }[]): DerivedTaskStatus {
  if (assignments.length === 0) return "todo";
  if (assignments.every((a) => a.status === "completed")) return "completed";
  if (assignments.some((a) => a.status === "in_progress" || a.status === "completed")) {
    return "in_progress";
  }
  return "todo";
}
```

## 11. Main User Flows

### Flow A — Create Team

1. User signs in.
2. User clicks `Create team`.
3. User enters team name.
4. App creates team and owner membership.
5. User lands in team dashboard.

### Flow B — Invite Member

1. Owner/admin opens team members page.
2. Enters invitee email.
3. Chooses role: `member` or `admin`.
4. App creates pending invite.
5. App displays copyable invite link or sends email.
6. Invitee signs in and accepts.
7. App creates active team membership.

### Flow C — Create Project

1. Owner/admin clicks `New project`.
2. Enters project name.
3. Project appears in sidebar.

### Flow D — Create Multi-Assignee Task

1. User opens project.
2. User clicks quick add or `New task`.
3. Enters title and optional details.
4. Opens assignee selector.
5. Selects one or more team members.
6. App creates task and one `taskAssignments` document per assignee.
7. Assigned users see the task in `My Tasks`.

### Flow E — Assigned User Updates Their Status

1. Assigned user opens `My Tasks`.
2. User selects status: `Todo`, `Doing`, or `Done`.
3. App updates only that user's assignment row.
4. Other assignees' statuses remain unchanged.
5. Overall task status updates automatically in UI.

## 12. UI Pages

Build these pages for MVP:

1. `/sign-in`
2. `/sign-up`
3. `/app`
   - Redirect to default team or onboarding.
4. `/app/my-tasks`
5. `/app/today`
6. `/app/upcoming`
7. `/app/team/[teamId]`
8. `/app/team/[teamId]/project/[projectId]`
9. `/app/team/[teamId]/members`
10. `/app/team/[teamId]/settings`
11. `/invite/[token]`

## 13. Component Requirements

Create reusable components:

- `AppShell`
- `Sidebar`
- `TeamSwitcher`
- `ProjectList`
- `TaskList`
- `TaskRow`
- `TaskCreateInput`
- `TaskDetailDrawer`
- `AssigneeSelector`
- `AssigneeStatusList`
- `StatusChip`
- `PriorityBadge`
- `DueDateBadge`
- `MemberAvatar`
- `InviteMemberDialog`
- `EmptyState`
- `LoadingState`

## 14. Task Row UI Requirements

Each task row should show:

- Checkbox-like status indicator for current user's own assignment, if assigned.
- Task title.
- Due date, if present.
- Priority indicator.
- Assignee avatars.
- Derived overall status.

If the current user is not assigned but can view the task as creator/admin, show assignment statuses but do not show an editable personal status control.

## 15. Task Detail UI Requirements

Task detail drawer should show:

- Title editor.
- Description editor.
- Project and section.
- Due date.
- Priority.
- Assignee list.
- Each assignee's current status.
- Current user's status control if assigned.
- Metadata: creator and created date.

Only authorized users should see edit controls.

## 16. Edge Cases

Handle these cases:

- User has no teams yet.
- Team has no projects.
- Project has no tasks.
- Task has no assignees.
- Invite is expired.
- Invite was already accepted.
- Invite email does not match signed-in user email.
- User tries to access a team they are not a member of.
- User tries to update another user's assignment status.
- Owner tries to remove themselves.
- Last owner/admin edge case.

## 17. Validation & Security

- Validate all function arguments using Convex validators.
- Use strict TypeScript types.
- Do not perform authorization only on the client.
- Use indexes for common queries.
- Avoid expensive database scans.
- Avoid Convex query `.filter` for large datasets where an index should exist.
- Sanitize and limit text field lengths.
- Keep task title required and non-empty.
- Use server timestamps.

Suggested limits:

- Team name: 2–60 characters.
- Project name: 1–80 characters.
- Task title: 1–200 characters.
- Task description: max 5,000 characters.
- Invite expiration: 7 days.

## 18. Acceptance Criteria

The MVP is complete when:

1. A user can sign up and sign in.
2. A user can create a team.
3. A team owner can invite another user.
4. The invited user can accept the invite and join the team.
5. A team owner/admin can create a project.
6. A user can create a task in a project.
7. A task can be assigned to one or more team members.
8. Assigned users see the task in `My Tasks`.
9. Each assigned user can independently set their own status to `todo`, `in_progress`, or `completed`.
10. A user cannot update another user's assignment status.
11. A non-member cannot access team data.
12. Task updates appear reactively through Convex.
13. The UI is clean, minimal, responsive, and usable.
14. There are clear empty states and loading states.
15. The codebase is organized and type-safe.

## 19. Suggested Folder Structure

```txt
app/
  sign-in/
  sign-up/
  invite/[token]/
  app/
    layout.tsx
    page.tsx
    my-tasks/
    today/
    upcoming/
    team/[teamId]/
      page.tsx
      members/
      settings/
      project/[projectId]/
components/
  app-shell/
  tasks/
  teams/
  projects/
  members/
  ui/
convex/
  schema.ts
  auth.ts
  profiles.ts
  teams.ts
  invites.ts
  projects.ts
  tasks.ts
  assignments.ts
  lib/
    authz.ts
    validators.ts
    time.ts
lib/
  utils.ts
  routes.ts
```

## 20. Implementation Order

Build in this order:

1. Project setup with Next.js, TypeScript, Tailwind, Convex.
2. Authentication.
3. Convex schema.
4. Authorization helper functions.
5. Team creation and membership.
6. Invite system.
7. Project CRUD.
8. Task CRUD.
9. Multi-assignee assignment system.
10. My Tasks / Today / Upcoming views.
11. Project task view.
12. UI polish and empty states.
13. Security and edge-case testing.
14. Final cleanup.

## 21. Testing Checklist

Manually test:

- Create team as User A.
- Invite User B.
- User B accepts invite.
- User A creates project.
- User A creates task assigned to User A and User B.
- User A marks only their assignment as completed.
- User B still sees their own assignment as todo.
- User B marks their assignment as in_progress.
- User A cannot directly mark User B's assignment as completed.
- Non-team User C cannot access team/project/task URLs.
- Owner/admin can edit task metadata.
- Member cannot remove other members.

## 22. Product Tone

The final app should feel like:

- Todoist-inspired in simplicity.
- Team-first in collaboration.
- Faster and lighter than traditional project management tools.
- Focused on clear responsibility, but flexible enough for multi-person tasks.

Build the smallest complete version first. Do not overbuild. Prioritize correctness, authorization, and clean UX over extra features.
