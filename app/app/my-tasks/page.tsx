import { AppShell } from "@/components/app-shell/app-shell";
import { TaskCreateInput } from "@/components/tasks/task-create-input";
import { TaskDetailDrawer } from "@/components/tasks/task-detail-drawer";
import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import { currentUserId, tasks } from "@/lib/mock-data";

export default function MyTasksPage() {
  const myTasks = tasks.filter((task) => task.assignments.some((assignment) => assignment.userId === currentUserId));

  return (
    <AppShell active="My Tasks" title="My Tasks" eyebrow="Launch Team" action={<Button className="hidden sm:inline-flex">New task</Button>}>
      <div className="space-y-6">
        <TaskCreateInput />
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Assigned to me" value={myTasks.length} />
          <Metric label="Due today" value={myTasks.filter((task) => task.dueDate?.toDateString() === new Date().toDateString()).length} />
          <Metric label="In progress" value={myTasks.filter((task) => task.assignments.some((assignment) => assignment.userId === currentUserId && assignment.status === "in_progress")).length} />
        </div>
        <TaskList tasks={myTasks} />
        {myTasks[0] && <TaskDetailDrawer task={myTasks[0]} />}
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
