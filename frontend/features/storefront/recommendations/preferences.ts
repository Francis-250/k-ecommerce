"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PreferenceKind = "search" | "view" | "image";

export type PreferenceEvent = {
  kind: PreferenceKind;
  keyword?: string;
  category?: string;
  audience?: string;
  timestamp: number;
};

const MAX_EVENTS = 300;

type PreferencesState = {
  events: PreferenceEvent[];
  recordSearch: (query: string) => void;
  recordImageSearch: (productType?: string) => void;
  recordView: (input: {
    name: string;
    category?: string;
    audience?: string;
  }) => void;
  clear: () => void;
};

function pushEvent(events: PreferenceEvent[], event: PreferenceEvent) {
  return [...events, event].slice(-MAX_EVENTS);
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      events: [],

      recordSearch: (query) => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return;
        set((state) => ({
          events: pushEvent(state.events, {
            kind: "search",
            keyword,
            timestamp: Date.now(),
          }),
        }));
      },

      recordImageSearch: (productType) => {
        const keyword = productType?.trim().toLowerCase();
        if (!keyword) return;
        set((state) => ({
          events: pushEvent(state.events, {
            kind: "image",
            keyword,
            timestamp: Date.now(),
          }),
        }));
      },

      recordView: ({ name, category, audience }) => {
        const keyword = name.trim().toLowerCase();
        if (!keyword && !category && !audience) return;
        set((state) => ({
          events: pushEvent(state.events, {
            kind: "view",
            keyword: keyword || undefined,
            category: category?.toLowerCase(),
            audience: audience?.toLowerCase(),
            timestamp: Date.now(),
          }),
        }));
      },

      clear: () => set({ events: [] }),
    }),
    {
      name: "storefront.preferences",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

type WeightMap = Record<string, number>;

function recencyWeight(timestamp: number, now: number) {
  const ageDays = (now - timestamp) / 86_400_000;
  return Math.max(0, 1 - ageDays / 14);
}

export type ScorableProduct = {
  name: string;
  category?: string;
  audience?: string;
};

export function useRecommendedProducts<T extends ScorableProduct>(
  products: T[],
  limit = 8,
): T[] {
  const events = usePreferencesStore((s) => s.events);

  return useMemo(() => {
    if (!products.length || !events.length) return [];
    const now = Date.now();
    const categories: WeightMap = {};
    const audiences: WeightMap = {};
    const keywords: WeightMap = {};

    for (const event of events) {
      const w = recencyWeight(event.timestamp, now);
      if (event.category) {
        categories[event.category] =
          (categories[event.category] ?? 0) + 3 * w;
      }
      if (event.audience) {
        audiences[event.audience] = (audiences[event.audience] ?? 0) + 2 * w;
      }
      if (event.keyword) {
        const parts = event.keyword
          .split(/\s+/)
          .filter((part) => part.length > 2);
        for (const part of parts) {
          keywords[part] = (keywords[part] ?? 0) + 1 * w;
        }
      }
    }

    const scored = products
      .map((product) => {
        const name = (product.name ?? "").toLowerCase();
        let score = 0;
        if (product.category) {
          score += categories[product.category.toLowerCase()] ?? 0;
        }
        if (product.audience) {
          score += audiences[product.audience.toLowerCase()] ?? 0;
        }
        for (const [keyword, weight] of Object.entries(keywords)) {
          if (name.includes(keyword)) score += weight;
        }
        return { product, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((entry) => entry.product);
  }, [products, events, limit]);
}