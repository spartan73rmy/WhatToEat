import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "../api/configApi";

export function useMenus() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["menus"],
    queryFn: menuApi.list,
  });

  const createMutation = useMutation({
    mutationFn: menuApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menus"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: menuApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menus"] }),
  });

  return {
    menus: query.data,
    isLoading: query.isLoading,
    createMenu: createMutation.mutate,
    deleteMenu: deleteMutation.mutate,
  };
}

export function useMenu(id: number) {
  return useQuery({
    queryKey: ["menu", id],
    queryFn: () => menuApi.get(id),
    enabled: !!id,
  });
}
