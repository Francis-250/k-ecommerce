"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "./store";

export function AuthAccountLink() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const logout = useAuthStore((state) => state.logout);
  const openAuthDrawer = useAuthStore((state) => state.openAuthDrawer);

  if (status === "authenticated" && user) {
    return (
      <a
        href="#logout"
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

  return (
    <button
      type="button"
      className="header-top-link-btn"
      onClick={() => openAuthDrawer("login")}
    >
      Login
    </button>
  );
}
