"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusChip } from "@/components/tasks/status-chip";
import { MemberAvatar } from "@/components/tasks/member-avatar";

export function TaskDetailDrawer({
  task,
  open,
  onOpenChange,
  hideTrigger = false,
}: {
  task: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <Dialog.Trigger asChild>
          <Button variant="secondary">Open detail drawer</Button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-dvh w-full max-w-xl overflow-y-auto border-l border-border bg-surface p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-xl font-bold">{task.title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close task detail">
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-3 leading-7 text-muted-foreground">{task.description}</Dialog.Description>
          <div className="mt-6 flex flex-wrap gap-2">
            <PriorityBadge priority={task.priority} />
            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold">{task.project?.name ?? task.projectName}</span>
          </div>
          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-bold">Assignment statuses</h3>
            {task.assignments.map((assignment: any) => {
              const profile = assignment.profile;
              return (
                <div key={assignment.userId} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <MemberAvatar userId={assignment.userId} profile={profile} size="md" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{profile?.name ?? profile?.email ?? "Unknown member"}</p>
                      {profile?.email && <p className="truncate text-sm text-muted-foreground">{profile.email}</p>}
                    </div>
                  </div>
                  <StatusChip status={assignment.status} />
                </div>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
