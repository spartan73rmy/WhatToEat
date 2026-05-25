import { pool } from "./pool";

export async function getConfig() {
  const { rows } = await pool.query("SELECT * FROM user_config WHERE id = 1");
  return rows[0] || null;
}

export async function updateConfig(data: Record<string, unknown>) {
  const keys = Object.keys(data);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = [1, ...keys.map((k) => data[k])];
  await pool.query(
    `UPDATE user_config SET ${setClause}, updated_at = NOW() WHERE id = $1`,
    values
  );
  return getConfig();
}

export async function listMenus() {
  const { rows } = await pool.query(
    "SELECT id, name, cuisine_overrides, difficulty, created_at FROM weekly_menus ORDER BY created_at DESC"
  );
  return rows;
}

export async function getMenu(id: number) {
  const { rows: menus } = await pool.query(
    "SELECT * FROM weekly_menus WHERE id = $1",
    [id]
  );
  if (!menus[0]) return null;
  const { rows: meals } = await pool.query(
    "SELECT * FROM meals WHERE menu_id = $1 ORDER BY day_index, meal_type",
    [id]
  );
  return { ...menus[0], meals };
}

export async function createMenu(data: {
  name: string;
  config_snapshot?: Record<string, unknown>;
  cuisine_overrides?: string[];
  difficulty?: string;
  pantry?: string[];
}) {
  const { rows } = await pool.query(
    `INSERT INTO weekly_menus (name, config_snapshot, cuisine_overrides, difficulty, pantry)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      data.name,
      data.config_snapshot ? JSON.stringify(data.config_snapshot) : null,
      data.cuisine_overrides || null,
      data.difficulty || null,
      data.pantry || null,
    ]
  );
  return rows[0];
}

export async function deleteMenu(id: number) {
  await pool.query("DELETE FROM weekly_menus WHERE id = $1", [id]);
}

export async function insertMeal(data: {
  menu_id: number;
  day_index: number;
  meal_type: string;
  is_snack?: boolean;
  dish_name: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fiber_g?: number;
  portions?: string;
  ingredients?: unknown[];
  recipe_steps?: string[];
  original_dish_name?: string;
}) {
  const { rows } = await pool.query(
    `INSERT INTO meals (menu_id, day_index, meal_type, is_snack, dish_name, calories, protein_g, carbs_g, fiber_g, portions, ingredients, recipe_steps, original_dish_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [
      data.menu_id,
      data.day_index,
      data.meal_type,
      data.is_snack || false,
      data.dish_name,
      data.calories || null,
      data.protein_g || null,
      data.carbs_g || null,
      data.fiber_g || null,
      data.portions || null,
      data.ingredients ? JSON.stringify(data.ingredients) : null,
      data.recipe_steps || null,
      data.original_dish_name || data.dish_name,
    ]
  );
  return rows[0];
}

export async function updateMeal(
  id: number,
  data: Record<string, unknown>
) {
  const keys = Object.keys(data);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = [id, ...keys.map((k) => data[k])];
  const { rows } = await pool.query(
    `UPDATE meals SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );
  return rows[0];
}

export async function rateMeal(id: number, rating: number) {
  const { rows } = await pool.query(
    "UPDATE meals SET user_rating = $1 WHERE id = $2 RETURNING *",
    [rating, id]
  );
  return rows[0];
}

export async function getHighRatedDishes(monthsAgo = 1) {
  const { rows } = await pool.query(
    `SELECT dish_name, MAX(m.created_at) as last_eaten
     FROM meals m
     JOIN weekly_menus wm ON m.menu_id = wm.id
     WHERE m.user_rating >= 4
     GROUP BY dish_name
     HAVING MAX(m.created_at) < NOW() - $1::INTERVAL`,
    [`${monthsAgo} month`]
  );
  return rows;
}

export async function listFavorites() {
  const { rows } = await pool.query(
    "SELECT * FROM favorite_dishes ORDER BY created_at DESC"
  );
  return rows;
}

export async function addFavorite(data: {
  dish_name: string;
  cuisine?: string;
  meal_type?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fiber_g?: number;
  portions?: string;
  ingredients?: unknown[];
  recipe_steps?: string[];
  notes?: string;
}) {
  const { rows } = await pool.query(
    `INSERT INTO favorite_dishes (dish_name, cuisine, meal_type, calories, protein_g, carbs_g, fiber_g, portions, ingredients, recipe_steps, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      data.dish_name,
      data.cuisine || null,
      data.meal_type || null,
      data.calories || null,
      data.protein_g || null,
      data.carbs_g || null,
      data.fiber_g || null,
      data.portions || null,
      data.ingredients ? JSON.stringify(data.ingredients) : null,
      data.recipe_steps || null,
      data.notes || null,
    ]
  );
  return rows[0];
}

export async function removeFavorite(id: number) {
  await pool.query("DELETE FROM favorite_dishes WHERE id = $1", [id]);
}
