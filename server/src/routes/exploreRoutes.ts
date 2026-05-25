import { Router } from "express";
import { getConfig } from "../db/queries";
import { exploreSchema, addToMenuSchema } from "../validators/schemas";
import { ai } from "../services/openRouterService";
import { insertMeal, getMenu } from "../db/queries";

const router = Router();

router.post("/", async (req, res) => {
  const { page, excludeDishes } = exploreSchema.parse(req.body);
  const config = await getConfig();

  if (!config) {
    res.status(400).json({ error: "Configura tu perfil primero" });
    return;
  }

  const profileContext = [
    `Edad: ${config.age}, Género: ${config.gender}`,
    `Estilo de vida: ${config.activity}`,
    `Objetivo: ${config.goal} con déficit calórico de ${config.calorie_deficit} kcal/día`,
    `Límite calórico diario: ${config.calorie_limit} kcal`,
  ].join("\n");

  const systemPrompt = [
    "Eres un chef nutricionista que sugiere platillos variados.",
    profileContext,
    "",
    "Reglas:",
    "- Cada platillo debe ser único",
    "- Incluye información nutricional aproximada",
    "- Variedad en tipos de comida, ingredientes y técnicas",
    "Responde ÚNICAMENTE con un JSON array, sin texto adicional.",
  ].join("\n");

  const userPrompt = [
    `Genera 10 platillos variados para una persona con este perfil.`,
    excludeDishes?.length
      ? `NO incluyas estos platillos ya mostrados: ${excludeDishes.join(", ")}`
      : "",
    "Formato JSON array:",
    `[
  {
    "dish_name": "...",
    "meal_type": "comida",
    "calories": 350,
    "protein_g": 20,
    "carbs_g": 40,
    "fiber_g": 8,
    "portions": "1 porción",
    "ingredients": [{"name": "...", "amount": 100, "unit": "g"}],
    "recipe_steps": ["Paso 1..."]
  }
]`,
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await ai.chat(userPrompt, systemPrompt);
  const cleaned = raw.replace(/```(json)?/g, "").trim();

  let dishes: unknown[];
  try {
    dishes = JSON.parse(cleaned);
  } catch {
    dishes = [];
  }

  res.json({ dishes, page: page || 1, hasMore: true });
});

router.post("/add-to-menu", async (req, res) => {
  const { menuId, dayIndex, mealType, dish } = addToMenuSchema.parse(req.body);

  const menu = await getMenu(menuId);
  if (!menu) {
    res.status(404).json({ error: "Menú no encontrado" });
    return;
  }

  const meal = await insertMeal({
    menu_id: menuId,
    day_index: dayIndex,
    meal_type: mealType,
    dish_name: dish.dish_name,
    calories: dish.calories,
    protein_g: dish.protein_g,
    carbs_g: dish.carbs_g,
    fiber_g: dish.fiber_g,
    portions: dish.portions,
    ingredients: dish.ingredients as any,
    recipe_steps: dish.recipe_steps,
    original_dish_name: dish.dish_name,
  });

  res.status(201).json(meal);
});

export default router;
