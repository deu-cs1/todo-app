"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MemberList({
  members,
  teamId,
  currentUserId,
  currentUserRole,
}: {
  members: any[];
  teamId: Id<"teams">;
  currentUserId: string;
  currentUserRole?: "owner" | "admin" | "member";
}) {
  const removeTeamMember = useMutation(api.teams.removeTeamMember);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canRemoveMembers = currentUserRole === "owner";

  async function onRemove(userId: string) {
    setRemovingUserId(userId);
    setError(null);
    try {
      await removeTeamMember({ teamId, userId });
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove member.");
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <div>
      {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      <div className="rounded-xl border border-border bg-surface">
        {members.map((member) => {
          const canRemoveThisMember = canRemoveMembers && member.userId !== currentUserId && member.role !== "owner";

          return (
            <div key={member._id} className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-sm font-bold text-white">
                  {getInitials(member.profile?.name ?? member.userId)}
                </span>
                <div>
                  <p className="font-semibold">{member.profile?.name ?? member.userId}</p>
                  <p className="text-sm text-muted-foreground">{member.profile?.email ?? "No email"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="border-border bg-background text-muted-foreground">{member.role}</Badge>
                {canRemoveThisMember && (
                  <Button variant="ghost" size="sm" onClick={() => void onRemove(member.userId)} disabled={removingUserId === member.userId}>
                    {removingUserId === member.userId ? "Removing" : "Remove"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
