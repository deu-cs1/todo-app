import { AppShell } from "@/components/app-shell/app-shell";
import { TaskList } from "@/components/tasks/task-list";
import { currentUserId, tasks } from "@/lib/mock-data";
import { startOfToday } from "@/lib/time";

export default function UpcomingPage() {
  const today = startOfToday();
  const upcomingTasks = tasks.filter(
    (task) => task.dueDate && task.dueDate > today && task.assignments.some((assignment) => assignment.userId === currentUserId),
  );

  return (
    <AppShell active="Upcoming" title="Upcoming" eyebrow="Next commitments">
      <TaskList tasks={upcomingTasks} />
    </AppShell>
  );
}
