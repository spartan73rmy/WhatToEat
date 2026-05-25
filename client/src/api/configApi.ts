import { UserConfig } from "../types";

const BASE = "/api/config";

export async function fetchConfig(): Promise<UserConfig> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Error al cargar configuración");
  return res.json();
}

export async function updateConfig(data: Partial<UserConfig>): Promise<UserConfig> {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al guardar configuración");
  return res.json();
}
