import { EmptyState } from "@/components/ui/empty-state";
import { TaskRow } from "@/components/tasks/task-row";
import { type Task } from "@/lib/mock-data";

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <EmptyState title="No tasks here" description="Tasks appear here as soon as they match this view." />;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <TaskRow key={task.id} task={task} index={index} />
      ))}
    </div>
  );
}
