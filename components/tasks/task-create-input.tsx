"use client";

import { Plus, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TaskCreateInput() {
  return (
    <form className="rounded-xl border border-border bg-surface p-3 shadow-line">
      <label htmlFor="quick-task" className="sr-only">
        Add a task
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          id="quick-task"
          type="text"
          placeholder="Add task, press Enter to keep moving"
          className="h-11 min-w-0 flex-1 rounded-lg border border-transparent bg-muted px-4 text-sm font-medium transition focus:border-primary focus:bg-white"
        />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1 sm:flex-none">
            <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
            Assignees
          </Button>
          <Button type="submit" className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </div>
    </form>
  );
}
