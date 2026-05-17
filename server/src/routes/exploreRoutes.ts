import { Router } from "express";
import { exploreSchema, addToMenuSchema } from "../validators/schemas";
import { exploreDishes } from "../services/menuService";
import pool from "../db/pool";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const parsed = exploreSchema.parse(req.body);
    const dishes = await exploreDishes(parsed);
    res.json(dishes);
  } catch (err) {
    next(err);
  }
});

router.post("/add-to-menu", async (req, res, next) => {
  try {
    const parsed = addToMenuSchema.parse(req.body);
    await pool.query(
      `INSERT INTO meals (menu_id, day_index, meal_type, dish_name, calories, protein_g, carbs_g, fiber_g, portions, ingredients, recipe_steps)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (menu_id, day_index, meal_type) DO UPDATE SET
         dish_name = EXCLUDED.dish_name,
         calories = EXCLUDED.calories,
         protein_g = EXCLUDED.protein_g,
         carbs_g = EXCLUDED.carbs_g,
         fiber_g = EXCLUDED.fiber_g,
         portions = EXCLUDED.portions,
         ingredients = EXCLUDED.ingredients,
         recipe_steps = EXCLUDED.recipe_steps`,
      [
        parsed.menuId,
        parsed.dayIndex,
        parsed.mealType,
        parsed.dish.dish_name,
        parsed.dish.calories,
        parsed.dish.protein_g,
        parsed.dish.carbs_g,
        parsed.dish.fiber_g,
        parsed.dish.portions,
        JSON.stringify(parsed.dish.ingredients || []),
        parsed.dish.recipe_steps || [],
      ]
    );
    res.status(200).json({ message: "Platillo agregado al menú" });
  } catch (err) {
    next(err);
  }
});

export default router;
