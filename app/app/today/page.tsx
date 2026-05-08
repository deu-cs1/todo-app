import { AppShell } from "@/components/app-shell/app-shell";
import { TaskCreateInput } from "@/components/tasks/task-create-input";
import { TaskList } from "@/components/tasks/task-list";
import { currentUserId, tasks } from "@/lib/mock-data";
import { isSameDay, startOfToday } from "@/lib/time";

export default function TodayPage() {
  const today = startOfToday();
  const todayTasks = tasks.filter(
    (task) => task.dueDate && isSameDay(task.dueDate, today) && task.assignments.some((assignment) => assignment.userId === currentUserId),
  );

  return (
    <AppShell active="Today" title="Today" eyebrow="Personal focus">
      <div className="space-y-6">
        <TaskCreateInput />
        <TaskList tasks={todayTasks} />
      </div>
    </AppShell>
  );
}
