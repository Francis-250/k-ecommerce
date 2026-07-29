"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./store";

export function AuthenticatedRedirect() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status !== "authenticated" || !user) return;

    router.replace(
      user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        ? "/admin"
        : "/my-account",
    );
  }, [router, status, user]);

  return null;
}
