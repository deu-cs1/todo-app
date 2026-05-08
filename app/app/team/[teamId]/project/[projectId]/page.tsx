import { AppShell } from "@/components/app-shell/app-shell";
import { TaskCreateInput } from "@/components/tasks/task-create-input";
import { TaskList } from "@/components/tasks/task-list";
import { projects, tasks } from "@/lib/mock-data";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = projects.find((item) => item.id === projectId);
  const projectTasks = tasks.filter((task) => task.projectId === projectId);

  return (
    <AppShell title={project?.name ?? "Project"} eyebrow="Team project">
      <div className="space-y-6">
        <TaskCreateInput />
        <TaskList tasks={projectTasks} />
      </div>
    </AppShell>
  );
}
