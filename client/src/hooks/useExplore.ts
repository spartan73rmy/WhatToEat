import { useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { exploreApi } from "../api/configApi";

interface ExploreFilters {
  meal_type?: string;
  difficulty?: string;
  cost?: string;
  craving?: string;
}

export function useExplore(enabled: boolean, filters?: ExploreFilters) {
  const abortRef = useRef<AbortController | null>(null);
  const seenDishes = new Set<string>();

  const query = useInfiniteQuery({
    queryKey: ["explore", filters],
    queryFn: ({ pageParam }) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      return exploreApi.explore({
        page: pageParam,
        excludeDishes: Array.from(seenDishes),
        ...filters,
      }, signal);
    },
    enabled,
    getNextPageParam: (_last, all) => all.length + 1,
    initialPageParam: 1,
  });

  return { ...query, cancel: () => { abortRef.current?.abort(); } };
}
