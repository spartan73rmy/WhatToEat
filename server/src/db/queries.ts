import pool from "./pool";

export async function getConfig() {
  const res = await pool.query("SELECT * FROM user_config WHERE id = 1");
  if (res.rows[0]) return res.rows[0];
  await pool.query("INSERT INTO user_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING");
  const inserted = await pool.query("SELECT * FROM user_config WHERE id = 1");
  return inserted.rows[0] || null;
}

export async function updateConfig(data: Record<string, unknown>) {
  const keys = Object.keys(data);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => data[k]);
  const res = await pool.query(
    `UPDATE user_config SET ${setClause}, updated_at = NOW() WHERE id = 1 RETURNING *`,
    values
  );
  return res.rows[0];
}

export async function getMenus() {
  const res = await pool.query(
    "SELECT * FROM weekly_menus ORDER BY created_at DESC"
  );
  return res.rows;
}

export async function getMenuWithMeals(id: number) {
  const menu = await pool.query("SELECT * FROM weekly_menus WHERE id = $1", [
    id,
  ]);
  if (!menu.rows[0]) return null;
  const meals = await pool.query(
    "SELECT * FROM meals WHERE menu_id = $1 ORDER BY day_index, meal_type",
    [id]
  );
  return { ...menu.rows[0], meals: meals.rows };
}

export async function createMenu(name: string) {
  const res = await pool.query(
    "INSERT INTO weekly_menus (name) VALUES ($1) RETURNING *",
    [name]
  );
  return res.rows[0];
}

export async function deleteMenu(id: number) {
  await pool.query("DELETE FROM weekly_menus WHERE id = $1", [id]);
}
