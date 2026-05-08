export type AssignmentStatus = "todo" | "in_progress" | "completed";
export type Priority = "low" | "medium" | "high";

export function deriveTaskStatus(assignments: Array<{ status: AssignmentStatus }>): AssignmentStatus {
  if (assignments.length === 0) return "todo";
  if (assignments.every((assignment) => assignment.status === "completed")) return "completed";
  if (assignments.some((assignment) => assignment.status !== "todo")) return "in_progress";
  return "todo";
}
