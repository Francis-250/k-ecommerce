"use client";

import { useEffect } from "react";
import { useAuthStore } from "./store";

export function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return null;
}
