import { Router } from "express";
import pool from "../db/pool";
import { favoriteSchema } from "../validators/schemas";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM favorite_dishes ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = favoriteSchema.parse(req.body);
    const existing = await pool.query(
      "SELECT id FROM favorite_dishes WHERE dish_name = $1 LIMIT 1",
      [parsed.dish_name]
    );
    if (existing.rows[0]) {
      return res.json(existing.rows[0]);
    }
    const result = await pool.query(
      `INSERT INTO favorite_dishes (dish_name, cuisine, meal_type, calories, protein_g, carbs_g, fiber_g, portions, ingredients, recipe_steps, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        parsed.dish_name,
        parsed.cuisine ?? null,
        parsed.meal_type ?? null,
        parsed.calories ?? null,
        parsed.protein_g ?? null,
        parsed.carbs_g ?? null,
        parsed.fiber_g ?? null,
        parsed.portions ?? null,
        parsed.ingredients ? JSON.stringify(parsed.ingredients) : null,
        parsed.recipe_steps ?? null,
        parsed.notes ?? null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM favorite_dishes WHERE id = $1", [
      parseInt(req.params.id),
    ]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
