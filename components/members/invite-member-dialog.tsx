"use client";

import { FormEvent, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { LinkIcon, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

export function InviteMemberDialog({ teamId }: { teamId?: Id<"teams"> }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [token, setToken] = useState<string | null>(null);
  const createInvite = useMutation(api.invites.createTeamInvite);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teamId || !email.trim()) return;
    const result = await createInvite({ teamId, email: email.trim(), role });
    setToken(result.token);
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Invite member</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-xl font-bold">Invite member</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close invite dialog">
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            Create a pending invite. The production mutation stores only a hashed invite token.
          </Dialog.Description>
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3" placeholder="teammate@company.com" />
            </label>
            <label className="block text-sm font-semibold">
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as "member" | "admin")} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3">
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <Button disabled={!teamId || !email.trim()} className="w-full">
              <LinkIcon className="h-4 w-4" aria-hidden="true" />
              Generate invite link
            </Button>
            {token && <p className="rounded-lg bg-muted p-3 text-xs font-medium text-muted-foreground">/invite/{token}</p>}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
