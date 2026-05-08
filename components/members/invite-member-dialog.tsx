"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InviteMemberDialog() {
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
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">
              Email
              <input type="email" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3" placeholder="teammate@company.com" />
            </label>
            <label className="block text-sm font-semibold">
              Role
              <select className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3">
                <option>member</option>
                <option>admin</option>
              </select>
            </label>
            <Button className="w-full">
              <LinkIcon className="h-4 w-4" aria-hidden="true" />
              Generate invite link
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
