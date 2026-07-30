"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "./api";

export const analyticsQueryKey = ["admin", "analytics"] as const;

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: analyticsQueryKey,
    queryFn: analyticsApi.getOverview,
  });
}
