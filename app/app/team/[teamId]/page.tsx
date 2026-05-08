import Link from "next/link";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/mock-data";

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  return (
    <AppShell title="Launch Team" eyebrow="Team dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/app/team/${teamId}/project/${project.id}`} className="rounded-xl border border-border bg-surface p-5 shadow-line transition hover:-translate-y-0.5 hover:shadow-soft">
            <span className="block h-2 w-14 rounded-full" style={{ backgroundColor: project.color }} />
            <h2 className="mt-5 text-xl font-bold">{project.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{project.taskCount} active tasks</p>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Button>New project</Button>
      </div>
    </AppShell>
  );
}
