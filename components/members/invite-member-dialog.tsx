"use client";

import { FormEvent, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { Send, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

export function InviteMemberDialog({ teamId }: { teamId?: Id<"teams"> }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createInvite = useMutation(api.invites.createTeamInvite);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teamId || !email.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setStatus(null);
    try {
      await createInvite({ teamId, email: email.trim(), role });
      setStatus("Invite created. It will appear in this user's Teams tab.");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invite.");
    } finally {
      setIsSubmitting(false);
    }
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
            Invite by email. Existing users will see who invited them and which team they can join from the Teams tab.
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
            <Button disabled={!teamId || !email.trim() || isSubmitting} className="w-full">
              <Send className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? "Creating invite" : "Invite by email"}
            </Button>
            {status && <p className="rounded-lg bg-muted p-3 text-xs font-medium text-muted-foreground">{status}</p>}
            {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
