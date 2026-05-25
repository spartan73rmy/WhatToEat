import { useState, useCallback } from "react";
import { fetchExploreDishes, addDishToMenu } from "../api/exploreApi";
import { ExploreDish } from "../types";

export function useExplore() {
  const [dishes, setDishes] = useState<ExploreDish[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const exclude = dishes.map((d) => d.dish_name);
      const result = await fetchExploreDishes(page, exclude);
      setDishes((prev) => [...prev, ...result.dishes]);
      setPage((p) => p + 1);
      setHasMore(result.hasMore);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, dishes]);

  const reset = useCallback(() => {
    setDishes([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return { dishes, loading, error, hasMore, loadMore, reset };
}

export { addDishToMenu };
