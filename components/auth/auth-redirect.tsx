"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "@convex-dev/auth/react";
import { LoadingState } from "@/components/ui/loading-state";

const hasAccountKey = "orbitask:has-account";

export function AuthRedirect() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace("/app/my-tasks");
      return;
    }
    const hasAccount = window.localStorage.getItem(hasAccountKey) === "true";
    router.replace(hasAccount ? "/sign-in" : "/sign-up");
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <LoadingState />
    </main>
  );
}

export function rememberAccount() {
  window.localStorage.setItem(hasAccountKey, "true");
}
