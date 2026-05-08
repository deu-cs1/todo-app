import { addDays, startOfToday } from "./time";

export type AssignmentStatus = "todo" | "in_progress" | "completed";
export type Priority = "low" | "medium" | "high" | "urgent";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  initials: string;
};

export type Project = {
  id: string;
  teamId: string;
  name: string;
  color: string;
  taskCount: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  dueDate?: Date;
  priority: Priority;
  createdById: string;
  assignments: Array<{
    userId: string;
    status: AssignmentStatus;
  }>;
};

export const currentUserId = "u1";

export const members: Member[] = [
  { id: "u1", name: "Ayse Demir", email: "ayse@orbitask.app", role: "owner", initials: "AD" },
  { id: "u2", name: "Mehmet Kaya", email: "mehmet@orbitask.app", role: "admin", initials: "MK" },
  { id: "u3", name: "Zeynep Arslan", email: "zeynep@orbitask.app", role: "member", initials: "ZA" },
  { id: "u4", name: "Can Yilmaz", email: "can@orbitask.app", role: "member", initials: "CY" },
];

export const teams = [
  { id: "team-alpha", name: "Launch Team", slug: "launch-team" },
  { id: "team-product", name: "Product Ops", slug: "product-ops" },
];

export const projects: Project[] = [
  { id: "proj-web", teamId: "team-alpha", name: "Website Launch", color: "#dc2626", taskCount: 8 },
  { id: "proj-beta", teamId: "team-alpha", name: "Beta Feedback", color: "#0f766e", taskCount: 5 },
  { id: "proj-growth", teamId: "team-alpha", name: "Growth Sprint", color: "#7c3aed", taskCount: 4 },
];

const today = startOfToday();

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Prepare launch landing page",
    description: "Finalize sections, conversion copy, and responsive polish before QA.",
    projectId: "proj-web",
    projectName: "Website Launch",
    dueDate: today,
    priority: "urgent",
    createdById: "u1",
    assignments: [
      { userId: "u1", status: "completed" },
      { userId: "u2", status: "in_progress" },
      { userId: "u3", status: "todo" },
    ],
  },
  {
    id: "t2",
    title: "Review invite acceptance edge cases",
    description: "Check expired, revoked, and mismatched-email invite flows.",
    projectId: "proj-beta",
    projectName: "Beta Feedback",
    dueDate: addDays(today, 1),
    priority: "high",
    createdById: "u2",
    assignments: [
      { userId: "u1", status: "in_progress" },
      { userId: "u2", status: "todo" },
    ],
  },
  {
    id: "t3",
    title: "Draft team member onboarding checklist",
    description: "Create a short workflow that shows multi-assignee responsibility clearly.",
    projectId: "proj-growth",
    projectName: "Growth Sprint",
    dueDate: addDays(today, 5),
    priority: "medium",
    createdById: "u3",
    assignments: [
      { userId: "u1", status: "todo" },
      { userId: "u4", status: "todo" },
    ],
  },
  {
    id: "t4",
    title: "Ship status chip accessibility pass",
    description: "Verify keyboard focus, labels, and color-independent status names.",
    projectId: "proj-web",
    projectName: "Website Launch",
    priority: "low",
    createdById: "u1",
    assignments: [{ userId: "u2", status: "completed" }],
  },
];

export function deriveTaskStatus(assignments: Task["assignments"]): AssignmentStatus {
  if (assignments.length === 0) return "todo";
  if (assignments.every((assignment) => assignment.status === "completed")) return "completed";
  if (assignments.some((assignment) => assignment.status !== "todo")) return "in_progress";
  return "todo";
}

export function getMember(userId: string) {
  return members.find((member) => member.id === userId);
}
