"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "convex/react";
import { Plus, UserRoundPlus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

export function TaskCreateInput({
  teamId,
  projectId,
  assigneeIds,
}: {
  teamId?: Id<"teams">;
  projectId?: Id<"projects">;
  assigneeIds?: string[];
}) {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const createTask = useMutation(api.tasks.createTask);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teamId || !projectId || !title.trim()) return;
    setIsSaving(true);
    try {
      await createTask({
        teamId,
        projectId,
        title: title.trim(),
        priority: "medium",
        assigneeIds: assigneeIds?.length ? assigneeIds : ["demo-user-ayse"],
      });
      setTitle("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-surface p-3 shadow-line">
      <label htmlFor="quick-task" className="sr-only">
        Add a task
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          id="quick-task"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add task, press Enter to keep moving"
          className="h-11 min-w-0 flex-1 rounded-lg border border-transparent bg-muted px-4 text-sm font-medium transition focus:border-primary focus:bg-white"
        />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1 sm:flex-none">
            <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
            Assignees
          </Button>
          <Button type="submit" disabled={!teamId || !projectId || !title.trim() || isSaving} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {isSaving ? "Adding" : "Add"}
          </Button>
        </div>
      </div>
    </form>
  );
}
