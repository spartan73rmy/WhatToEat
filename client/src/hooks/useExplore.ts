import { useInfiniteQuery } from "@tanstack/react-query";
import { exploreApi } from "../api/configApi";

export function useExplore() {
  return useInfiniteQuery({
    queryKey: ["explore"],
    queryFn: ({ pageParam }) => exploreApi.explore({ page: pageParam, excludeDishes: [] }),
    getNextPageParam: (_last, all) => all.length + 1,
    initialPageParam: 1,
  });
}
