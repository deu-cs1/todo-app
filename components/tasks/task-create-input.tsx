"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { CalendarDays, Check, Flag, Plus, UserRoundPlus } from "lucide-react";
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

type AssigneeOption = {
  userId: string;
  profile?: {
    name?: string;
    email?: string;
  } | null;
};

export function TaskCreateInput({
  teamId,
  projectId,
  assignees,
  defaultAssigneeIds = [],
}: {
  teamId?: Id<"teams">;
  projectId?: Id<"projects">;
  assignees?: AssigneeOption[];
  defaultAssigneeIds?: string[];
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(defaultAssigneeIds);
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const assigneePickerRef = useRef<HTMLDivElement>(null);
  const createTask = useMutation(api.tasks.createTask);

  useEffect(() => {
    setSelectedAssigneeIds((current) => current.filter((userId) => assignees?.some((assignee) => assignee.userId === userId)));
  }, [assignees]);

  useEffect(() => {
    if (!isAssigneePickerOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!assigneePickerRef.current?.contains(event.target as Node)) {
        setIsAssigneePickerOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [isAssigneePickerOpen]);

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
        assigneeIds: selectedAssigneeIds,
      });
      setTitle("");
      setDueDate("");
      setPriority("medium");
      setSelectedAssigneeIds(defaultAssigneeIds.filter((userId) => assignees?.some((assignee) => assignee.userId === userId)));
      setIsAssigneePickerOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  function toggleAssignee(userId: string) {
    setSelectedAssigneeIds((current) => (current.includes(userId) ? current.filter((item) => item !== userId) : [...current, userId]));
  }

  const selectedAssignees = assignees?.filter((assignee) => selectedAssigneeIds.includes(assignee.userId)) ?? [];

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
          <div ref={assigneePickerRef} className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("justify-start text-muted-foreground sm:justify-center", isAssigneePickerOpen && "bg-muted text-foreground")}
              onClick={() => setIsAssigneePickerOpen((isOpen) => !isOpen)}
              aria-expanded={isAssigneePickerOpen}
            >
              <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
              {selectedAssignees.length > 0 ? `${selectedAssignees.length} selected` : "Assignees"}
            </Button>
            {isAssigneePickerOpen && (
              <div className="absolute right-0 top-11 z-30 w-72 rounded-xl border border-border bg-surface p-3 shadow-soft">
                <div className="flex flex-wrap gap-2">
                  {assignees?.length ? (
                    assignees.map((assignee) => {
                      const selected = selectedAssigneeIds.includes(assignee.userId);
                      const name = getAssigneeName(assignee);
                      return (
                        <button
                          key={assignee.userId}
                          type="button"
                          onClick={() => toggleAssignee(assignee.userId)}
                          className={cn(
                            "flex max-w-full items-center gap-2 rounded-full border px-2 py-1 text-left text-xs font-bold transition",
                            selected ? "border-red-200 bg-red-50 text-red-700" : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                          )}
                          aria-pressed={selected}
                        >
                          <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold", selected ? "bg-red-600 text-white" : "bg-foreground text-white")}>
                            {getInitials(name)}
                          </span>
                          <span className="min-w-0 truncate">{name}</span>
                          {selected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground">No team members found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function dateInputToTimestamp(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function getAssigneeName(assignee: AssigneeOption) {
  return assignee.profile?.name ?? assignee.profile?.email ?? "Unknown user";
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}
