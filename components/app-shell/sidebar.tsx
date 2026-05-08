import Link from "next/link";
import { CalendarDays, CircleDot, Inbox, LayoutList, Settings, UsersRound } from "lucide-react";
import { projects, teams } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/my-tasks", label: "My Tasks", icon: Inbox },
  { href: "/app/today", label: "Today", icon: CalendarDays },
  { href: "/app/upcoming", label: "Upcoming", icon: LayoutList },
];

export function Sidebar({ active = "My Tasks" }: { active?: string }) {
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
              active === item.label && "bg-red-50 text-red-700",
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <p className="px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Teams</p>
        <div className="mt-3 rounded-xl border border-border bg-background p-3">
          <p className="text-sm font-bold">{teams[0].name}</p>
          <p className="mt-1 text-xs text-muted-foreground">4 members</p>
        </div>
      </div>
      <div className="mt-6">
        <p className="px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Projects</p>
        <div className="mt-3 space-y-1">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/app/team/team-alpha/project/${project.id}`}
              className="flex h-10 items-center justify-between rounded-lg px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="truncate">{project.name}</span>
              </span>
              <span className="text-xs">{project.taskCount}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-6 border-t border-border pt-4">
        <Link
          href="/app/team/team-alpha/members"
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          Members
        </Link>
        <Link
          href="/app/team/team-alpha/settings"
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
