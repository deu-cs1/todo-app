"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell/app-shell";
import { TaskCreateInput } from "@/components/tasks/task-create-input";
import { TaskList } from "@/components/tasks/task-list";
import { LoadingState } from "@/components/ui/loading-state";

export function TodayView() {
  const workspace = useQuery(api.teams.getMyWorkspace);
  const tasks = useQuery(api.tasks.listTodayTasks);
  const defaultProject = workspace?.projects[0];

  return (
    <AppShell active="Today" title="Today" eyebrow="Personal focus">
      <div className="space-y-6">
        <TaskCreateInput teamId={workspace?.team?._id} projectId={defaultProject?._id} assigneeIds={["demo-user-ayse"]} />
        {!tasks ? <LoadingState /> : <TaskList tasks={tasks} />}
      </div>
    </AppShell>
  );
}
