"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const { signOut } = useAuthActions();

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label="Sign out"
      onClick={async () => {
        await signOut();
        router.replace("/sign-in");
      }}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
