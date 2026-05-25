import { ExploreDish } from "../types";

const BASE = "/api/explore";

export async function fetchExploreDishes(
  page: number = 1,
  excludeDishes: string[] = []
): Promise<{ dishes: ExploreDish[]; page: number; hasMore: boolean }> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, excludeDishes }),
  });
  if (!res.ok) throw new Error("Error al explorar platillos");
  return res.json();
}

export async function addDishToMenu(data: {
  menuId: number;
  dayIndex: number;
  mealType: string;
  dish: ExploreDish;
}) {
  const res = await fetch(`${BASE}/add-to-menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menuId: data.menuId,
      dayIndex: data.dayIndex,
      mealType: data.mealType,
      dish: data.dish,
    }),
  });
  if (!res.ok) throw new Error("Error al agregar platillo al menú");
  return res.json();
}
