import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFavorites, addFavorite, removeFavorite } from "../api/favoritesApi";
import { FavoriteDish } from "../types";

export function useFavorites() {
  return useQuery<FavoriteDish[]>({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addFavorite,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}
