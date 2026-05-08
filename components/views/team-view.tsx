"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export function TeamView() {
  const workspace = useQuery(api.teams.getMyWorkspace);

  return (
    <AppShell title={workspace?.team?.name ?? "Team"} eyebrow="Team dashboard">
      {workspace === undefined ? (
        <LoadingState />
      ) : workspace === null ? (
        <EmptyState title="No team yet" description="Create a team to start adding projects, members, and shared tasks." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {workspace.projects.map((project) => (
              <Link key={project._id} href={`/app/team/${workspace.team._id}/project/${project._id}`} className="rounded-xl border border-border bg-surface p-5 shadow-line transition hover:-translate-y-0.5 hover:shadow-soft">
                <span className="block h-2 w-14 rounded-full" style={{ backgroundColor: project.color ?? "#dc2626" }} />
                <h2 className="mt-5 text-xl font-bold">{project.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{project.description ?? "Team project"}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Button>New project</Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
