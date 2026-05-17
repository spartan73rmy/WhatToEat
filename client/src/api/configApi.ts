const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const configApi = {
  get: () => request<any>("/config"),
  update: (data: any) =>
    request<any>("/config", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const menuApi = {
  list: () => request<any[]>("/menus"),
  get: (id: number) => request<any>(`/menus/${id}`),
  create: (name: string) =>
    request<any>("/menus", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  generate: (data: any) =>
    request<any>("/menus/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/menus/${id}`, { method: "DELETE" }),
  swapMeal: (menuId: number, data: any) =>
    request<any>(`/menus/${menuId}/swap-meal`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  rateMeal: (menuId: number, mealId: number, rating: number) =>
    request<any>(`/menus/${menuId}/meals/${mealId}/rate`, {
      method: "PUT",
      body: JSON.stringify({ rating }),
    }),
};

export const exploreApi = {
  explore: (data: any) =>
    request<any[]>("/explore", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addToMenu: (data: any) =>
    request<any>("/explore/add-to-menu", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const favoritesApi = {
  list: () => request<any[]>("/favorites"),
  add: (data: any) =>
    request<any>("/favorites", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`/favorites/${id}`, { method: "DELETE" }),
};
