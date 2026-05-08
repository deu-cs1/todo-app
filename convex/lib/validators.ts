import { v } from "convex/values";

export const priority = v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"));
export const assignmentStatus = v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed"));
export const teamRole = v.union(v.literal("owner"), v.literal("admin"), v.literal("member"));
export const inviteRole = v.union(v.literal("admin"), v.literal("member"));

export function assertLength(value: string, min: number, max: number, field: string) {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new Error(`${field} must be between ${min} and ${max} characters.`);
  }
  return trimmed;
}
