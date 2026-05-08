"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { CalendarDays, CircleDot, Inbox, LayoutList, Settings, UsersRound } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/my-tasks", label: "My Tasks", icon: Inbox },
  { href: "/app/today", label: "Today", icon: CalendarDays },
  { href: "/app/upcoming", label: "Upcoming", icon: LayoutList },
  { href: "/app/teams", label: "Teams", icon: UsersRound },
];

export function Sidebar({ active = "My Tasks" }: { active?: string }) {
  const pathname = usePathname();
  const activeItem =
    navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ??
    (pathname.includes("/members") ? "Members" : pathname.includes("/settings") ? "Settings" : pathname.includes("/team/") ? "Teams" : active);
  const workspace = useQuery(api.teams.getMyWorkspace);
  const team = workspace?.team;
  const projects = workspace?.projects ?? [];
  const members = workspace?.members ?? [];

  return (
    <aside className="hidden h-dvh w-72 shrink-0 border-r border-border bg-surface p-4 lg:block">
      <Link href="/" className="flex h-11 items-center gap-2 px-2 font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-white">
          <CircleDot className="h-4 w-4" aria-hidden="true" />
        </span>
        Orbitask
      </Link>
      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
              activeItem === item.label && "bg-red-50 text-red-700",
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <p className="px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Workspace</p>
        <div className="mt-3 rounded-xl border border-border bg-background p-3">
          <p className="text-sm font-bold">{workspace === undefined ? "Loading workspace" : team?.name ?? "No workspace"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{team ? `${members.length} member personal space` : "Preparing personal workspace"}</p>
        </div>
      </div>
      <div className="mt-6">
        <p className="px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Projects</p>
        <div className="mt-3 space-y-1">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/app/team/${project.teamId}/project/${project._id}`}
              className="flex h-10 items-center justify-between rounded-lg px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color ?? "#dc2626" }} />
                <span className="truncate">{project.name}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-6 border-t border-border pt-4">
        <Link
          href={team ? `/app/team/${team._id}/settings` : "/app/my-tasks"}
          className={cn(
            "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
            activeItem === "Settings" && "bg-red-50 text-red-700",
          )}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
