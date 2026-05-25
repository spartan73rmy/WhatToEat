import { WeeklyMenu } from "../types";

const BASE = "/api/menus";

export async function fetchMenus(): Promise<WeeklyMenu[]> {
  const res = await fetch(BASE);
  return res.json();
}

export async function fetchMenu(id: number): Promise<WeeklyMenu> {
  const res = await fetch(`${BASE}/${id}`);
  return res.json();
}

export async function createMenu(name: string): Promise<WeeklyMenu> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteMenu(id: number): Promise<void> {
  await fetch(`${BASE}/${id}`, { method: "DELETE" });
}

export async function generateMenu(data: {
  name: string;
  cuisines: string[];
  difficulty?: string;
  pantry?: string[];
  profileOverrides?: Record<string, unknown>;
}): Promise<WeeklyMenu> {
  const res = await fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al generar menú");
  }
  return res.json();
}

export async function swapMeal(
  menuId: number,
  data: {
    dayIndex: number;
    mealType: string;
    preferredIngredients?: string[];
    cravings?: string;
    avoidIngredients?: string[];
  }
) {
  const res = await fetch(`${BASE}/${menuId}/swap-meal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al reemplazar comida");
  }
  return res.json();
}

export async function rateMeal(menuId: number, mealId: number, rating: number) {
  const res = await fetch(`${BASE}/${menuId}/meals/${mealId}/rate`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating }),
  });
  return res.json();
}

export async function updateMeal(menuId: number, mealId: number, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/${menuId}/meals/${mealId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
