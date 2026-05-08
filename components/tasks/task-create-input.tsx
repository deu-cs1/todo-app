"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "convex/react";
import { CalendarDays, Flag, Plus, UserRoundPlus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { type Priority } from "@/lib/task-utils";
import { cn } from "@/lib/utils";

const priorityOptions: Array<{ value: Priority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

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
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
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
        dueDate: dueDate ? dateInputToTimestamp(dueDate) : undefined,
        priority,
        assigneeIds: assigneeIds ?? [],
      });
      setTitle("");
      setDueDate("");
      setPriority("medium");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border/80 bg-surface/70 p-2 transition focus-within:border-foreground/25 focus-within:bg-surface">
      <label htmlFor="quick-task" className="sr-only">
        Add a task
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id="quick-task"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task"
            className="h-11 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground/75 transition focus:bg-background focus:outline-none"
          />
          <Button type="submit" disabled={!teamId || !projectId || !title.trim() || isSaving} className="h-10 shrink-0 px-3 sm:w-auto">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {isSaving ? "Adding" : "Add"}
          </Button>
        </div>
        <div className="flex flex-col gap-2 border-t border-border/70 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-within:bg-muted focus-within:text-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>Due</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-8 w-[128px] bg-transparent text-xs font-semibold text-foreground outline-none"
              />
            </label>
            <div className="inline-flex h-9 items-center gap-1 rounded-lg px-1 text-xs font-semibold text-muted-foreground">
              <Flag className="h-4 w-4" aria-hidden="true" />
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  aria-pressed={priority === option.value}
                  className={cn(
                    "h-7 rounded-md px-2 text-xs font-bold transition",
                    priority === option.value ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" className="justify-start text-muted-foreground sm:justify-center">
            <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
            Assignees
          </Button>
        </div>
      </div>
    </form>
  );
}

function dateInputToTimestamp(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}
