"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "./store";

function RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status !== "authenticated" || !user) return;

    const redirect = searchParams.get("redirect");
    const target =
      redirect && redirect.startsWith("/")
        ? redirect
        : user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          ? "/admin"
          : "/";

    router.replace(target);
  }, [router, searchParams, status, user]);

  return null;
}

export function AuthenticatedRedirect() {
  return (
    <Suspense fallback={null}>
      <RedirectHandler />
    </Suspense>
  );
}
