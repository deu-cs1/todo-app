import { EmptyState } from "@/components/ui/empty-state";
import { TaskRow } from "@/components/tasks/task-row";

export function TaskList({ tasks }: { tasks: any[] }) {
  if (tasks.length === 0) {
    return <EmptyState title="No tasks here" description="Tasks appear here as soon as they match this view." />;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <TaskRow key={task._id ?? task.id} task={task} index={index} />
      ))}
    </div>
  );
}
