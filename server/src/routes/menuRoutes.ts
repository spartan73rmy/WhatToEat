import { Router } from "express";
import {
  getMenus,
  getMenuWithMeals,
  createMenu,
  deleteMenu,
} from "../db/queries";
import { generateMenu, swapMeal } from "../services/menuService";
import { generateMenuSchema, swapMealSchema } from "../validators/schemas";
import pool from "../db/pool";

const router = Router();

router.get("/", async (_req, res) => {
  const menus = await getMenus();
  res.json(menus);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const menu = await getMenuWithMeals(id);
  if (!menu) return res.status(404).json({ error: "Menú no encontrado" });
  res.json(menu);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  const menu = await createMenu(name);
  res.status(201).json(menu);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await deleteMenu(id);
  res.status(204).send();
});

router.post("/generate", async (req, res, next) => {
  try {
    const parsed = generateMenuSchema.parse(req.body);
    const menu = await generateMenu(parsed);
    res.status(201).json(menu);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/swap-meal", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = swapMealSchema.parse(req.body);
    const updated = await swapMeal(id, parsed);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/meals/:mealId", async (req, res, next) => {
  try {
    const mealId = parseInt(req.params.mealId);
    const { dish_name, calories, protein_g, carbs_g, fiber_g, portions } = req.body;
    const updated = await pool.query(
      `UPDATE meals SET dish_name = COALESCE($1, dish_name), calories = COALESCE($2, calories),
       protein_g = COALESCE($3, protein_g), carbs_g = COALESCE($4, carbs_g),
       fiber_g = COALESCE($5, fiber_g), portions = COALESCE($6, portions)
       WHERE id = $7 RETURNING *`,
      [dish_name, calories, protein_g, carbs_g, fiber_g, portions, mealId]
    );
    if (!updated.rows[0]) return res.status(404).json({ error: "Comida no encontrada" });
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/meals/:mealId/rate", async (req, res, next) => {
  try {
    const mealId = parseInt(req.params.mealId);
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating debe ser entre 1 y 5" });
    }
    const updated = await pool.query(
      "UPDATE meals SET user_rating = $1 WHERE id = $2 RETURNING *",
      [rating, mealId]
    );
    if (!updated.rows[0]) return res.status(404).json({ error: "Comida no encontrada" });
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
