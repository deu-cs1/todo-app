"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { Bell } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditableWorkspace = {
  id: Id<"teams">;
  name: string;
  canRename: boolean;
};

export function AppShell({
  active: _active,
  title,
  eyebrow,
  workspace,
  action,
  children,
}: {
  active?: string;
  title: string;
  eyebrow?: string;
  workspace?: EditableWorkspace;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 border-b border-border bg-background/92 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            {workspace ? <WorkspaceName workspace={workspace} fallback={eyebrow} /> : eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>}
            <h1 className="truncate text-2xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationMenu />
            <SignOutButton />
            {action}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</div>
    </main>
  );
}

function NotificationMenu() {
  const notifications = useQuery(api.notifications.listMine) as
    | Array<{
        _id: Id<"notifications">;
        title: string;
        body: string;
        createdAt: number;
        readAt?: number;
      }>
    | undefined;
  const setRead = useMutation(api.notifications.setRead);
  const [isOpen, setIsOpen] = useState(false);
  const hasUnread = notifications?.some((notification) => !notification.readAt) ?? false;

  return (
    <div className="relative">
      <Button variant="secondary" size="icon" aria-label="Notifications" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} className="relative">
        <Bell className="h-4 w-4" aria-hidden="true" />
        {hasUnread && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary" aria-hidden="true" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-foreground">Notifications</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Task, invite, and status updates</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications === undefined ? (
              <p className="px-4 py-5 text-sm text-muted-foreground">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <label key={notification._id} className="flex cursor-pointer gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/60">
                  <input
                    type="checkbox"
                    checked={Boolean(notification.readAt)}
                    onChange={(event) => void setRead({ notificationId: notification._id, read: event.currentTarget.checked })}
                    className="mt-1 h-4 w-4 rounded border-border accent-red-600"
                    aria-label={`Mark ${notification.title} as read`}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{notification.title}</span>
                      {!notification.readAt && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{notification.body}</span>
                    <span className="mt-1 block text-xs font-medium text-muted-foreground">{formatNotificationTime(notification.createdAt)}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatNotificationTime(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function WorkspaceName({ workspace, fallback }: { workspace: EditableWorkspace; fallback?: string }) {
  const renameWorkspace = useMutation(api.teams.renameWorkspace);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(workspace.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setValue(workspace.name);
    }
  }, [isEditing, workspace.name]);

  async function saveName() {
    if (isSaving) return;
    const nextName = value.trim();
    if (!nextName || nextName === workspace.name) {
      setValue(workspace.name);
      setIsEditing(false);
      setError(null);
      return;
    }

    setIsSaving(true);
    try {
      await renameWorkspace({ teamId: workspace.id, name: nextName });
      setIsEditing(false);
      setError(null);
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : "Could not rename workspace.");
    } finally {
      setIsSaving(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveName();
  }

  if (isEditing) {
    return (
      <form onSubmit={onSubmit} className="mb-0.5">
        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => void saveName()}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setValue(workspace.name);
              setIsEditing(false);
              setError(null);
            }
          }}
          disabled={isSaving}
          className="h-6 max-w-full rounded-md border border-border bg-background px-2 text-xs font-bold uppercase tracking-wide text-foreground outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
          minLength={2}
          maxLength={60}
          aria-label="Workspace name"
        />
        {error && <p className="mt-1 max-w-xs text-xs font-semibold normal-case tracking-normal text-red-600">{error}</p>}
      </form>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "block max-w-full truncate text-left text-xs font-bold uppercase tracking-wide text-muted-foreground",
        workspace.canRename && "cursor-text rounded-md transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-red-100",
      )}
      onDoubleClick={() => {
        if (workspace.canRename) setIsEditing(true);
      }}
      aria-disabled={!workspace.canRename}
      title={workspace.canRename ? "Double-click to rename workspace" : fallback}
    >
      {workspace.name}
    </button>
  );
}
