import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "../api/configApi";

export function useFavorites() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["favorites"],
    queryFn: favoritesApi.list,
  });

  const addMutation = useMutation({
    mutationFn: favoritesApi.add,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const removeMutation = useMutation({
    mutationFn: favoritesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return {
    favorites: query.data,
    isLoading: query.isLoading,
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
  };
}
