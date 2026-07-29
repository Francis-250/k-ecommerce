"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "./store";

export function AuthAccountLink() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const logout = useAuthStore((state) => state.logout);

  if (status === "authenticated" && user) {
    return (
      <a
        href="/login"
        onClick={async (event) => {
          event.preventDefault();
          await logout();
          toast.success("You have been signed out");
        }}
      >
        Logout
      </a>
    );
  }

  return <Link href="/login">Login</Link>;
}
