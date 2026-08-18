"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "./preferences";

export function RecordProductView({
  name,
  category,
}: {
  name: string;
  category: string;
}) {
  const recordView = usePreferencesStore((state) => state.recordView);

  useEffect(() => {
    recordView({ name, category });
  }, [name, category, recordView]);

  return null;
}