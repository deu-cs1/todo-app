"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell/app-shell";
import { TaskList } from "@/components/tasks/task-list";
import { LoadingState } from "@/components/ui/loading-state";

export function UpcomingView() {
  const tasks = useQuery(api.tasks.listUpcomingTasks);

  return (
    <AppShell active="Upcoming" title="Upcoming" eyebrow="Next commitments">
      {!tasks ? <LoadingState /> : <TaskList tasks={tasks} />}
    </AppShell>
  );
}
