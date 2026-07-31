"use client";

import { useEffect } from "react";
import { useAuthStore, type AuthDrawerTab } from "./store";

export function AuthDrawerAutoOpen({ tab }: { tab: AuthDrawerTab }) {
  const openAuthDrawer = useAuthStore((state) => state.openAuthDrawer);
  useEffect(() => {
    openAuthDrawer(tab);
  }, [openAuthDrawer, tab]);
  return null;
}
