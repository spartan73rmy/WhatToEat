import { FavoriteDish } from "../types";

const BASE = "/api/favorites";

export async function fetchFavorites(): Promise<FavoriteDish[]> {
  const res = await fetch(BASE);
  return res.json();
}

export async function addFavorite(data: Omit<FavoriteDish, "id" | "created_at">): Promise<FavoriteDish> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function removeFavorite(id: number): Promise<void> {
  await fetch(`${BASE}/${id}`, { method: "DELETE" });
}
