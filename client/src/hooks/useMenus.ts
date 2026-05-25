import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMenus,
  fetchMenu,
  createMenu,
  deleteMenu,
  generateMenu,
  swapMeal,
  rateMeal,
} from "../api/menuApi";
import { WeeklyMenu } from "../types";

export function useMenus() {
  return useQuery<WeeklyMenu[]>({
    queryKey: ["menus"],
    queryFn: fetchMenus,
  });
}

export function useMenu(id: number) {
  return useQuery<WeeklyMenu>({
    queryKey: ["menu", id],
    queryFn: () => fetchMenu(id),
    enabled: !!id,
  });
}

export function useCreateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMenu,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menus"] }),
  });
}

export function useDeleteMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menus"] }),
  });
}

export function useGenerateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: generateMenu,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menus"] });
    },
  });
}

export function useSwapMeal(menuId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof swapMeal>[1]) => swapMeal(menuId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu", menuId] }),
  });
}

export function useRateMeal(menuId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, rating }: { mealId: number; rating: number }) =>
      rateMeal(menuId, mealId, rating),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu", menuId] }),
  });
}
