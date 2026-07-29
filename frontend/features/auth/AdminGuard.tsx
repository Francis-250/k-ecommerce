"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./store";

function hasAdminAccess(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const authorized = status === "authenticated" && hasAdminAccess(user?.role);

  useEffect(() => {
    if (status === "idle") {
      void initialize();
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && !hasAdminAccess(user?.role)) {
      router.replace("/my-account");
    }
  }, [initialize, router, status, user?.role]);

  if (!authorized) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div
          className="size-9 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
          role="status"
          aria-label="Checking administrator access"
        />
      </div>
    );
  }

  return children;
}
