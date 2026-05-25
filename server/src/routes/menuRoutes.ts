import { Router } from "express";
import {
  listMenus,
  getMenu,
  createMenu,
  deleteMenu,
  insertMeal,
  updateMeal,
  rateMeal,
  getConfig,
  updateConfig,
  getHighRatedDishes,
} from "../db/queries";
import { generateMenuSchema, swapMealSchema, rateMealSchema } from "../validators/schemas";
import { ai } from "../services/openRouterService";

const router = Router();

const INTENSITY_MAP: Record<string, string> = {
  ligero: "ligera",
  normal: "normal",
  sustancioso: "sustanciosa",
};

function buildProfileContext(config: Record<string, unknown>) {
  return [
    `Edad: ${config.age}, Género: ${config.gender}`,
    `Estilo de vida: ${config.activity}`,
    `Objetivo: ${config.goal} con déficit calórico de ${config.calorie_deficit} kcal/día`,
    `Límite calórico diario: ${config.calorie_limit} kcal`,
    `Distribución: ${config.meal_pattern}`,
    `Snacks: ${config.include_snacks ? "Sí" : "No"}`,
    `Intensidades: desayuno ${INTENSITY_MAP[config.breakfast_intensity as string] || "normal"}, almuerzo ${INTENSITY_MAP[config.almuerzo_intensity as string] || "normal"}, comida ${INTENSITY_MAP[config.comida_intensity as string] || "normal"}, cena ${INTENSITY_MAP[config.cena_intensity as string] || "normal"}`,
    `Balance: Proteína ~25% | Carbohidratos ~50% | Fibra ~25%`,
  ].join("\n");
}

router.get("/", async (_req, res) => {
  const menus = await listMenus();
  res.json(menus);
});

router.get("/:id", async (req, res) => {
  const menu = await getMenu(Number(req.params.id));
  if (!menu) {
    res.status(404).json({ error: "Menú no encontrado" });
    return;
  }
  res.json(menu);
});

router.post("/", async (req, res) => {
  const menu = await createMenu({ name: req.body.name });
  res.status(201).json(menu);
});

router.delete("/:id", async (req, res) => {
  await deleteMenu(Number(req.params.id));
  res.status(204).end();
});

router.post("/generate", async (req, res) => {
  const { name, cuisines, difficulty, pantry, profileOverrides } =
    generateMenuSchema.parse(req.body);

  let config = await getConfig();

  if (!config) {
    res.status(400).json({ error: "Configura tu perfil primero" });
    return;
  }

  if (profileOverrides) {
    await updateConfig(profileOverrides as Record<string, unknown>);
    config = await getConfig();
  }

  const profileContext = buildProfileContext(config);

  const eligibleDishes = await getHighRatedDishes(1);
  const reSuggestClause =
    eligibleDishes.length > 0
      ? `Platillos que disfrutó (puedes re-sugerir si pasó ≥1 mes): ${eligibleDishes.map((r: any) => r.dish_name).join(", ")}`
      : "";

  const systemPrompt = [
    "Eres un chef nutricionista especializado en menús personalizados.",
    "Respondes ÚNICAMENTE con JSON válido, sin texto adicional.",
    "",
    profileContext,
    `Cocinas: ${cuisines.join(", ")}`,
    `Dificultad: ${difficulty || "cualquiera"}`,
    pantry?.length ? `Ingredientes disponibles: ${pantry.join(", ")}` : "",
    "",
    "Reglas:",
    "- NO repetir platillos en la misma semana",
    "- Incluir porciones, ingredientes con cantidades, y pasos de receta",
    reSuggestClause,
  ]
    .filter(Boolean)
    .join("\n");

  const userPrompt = [
    `Genera un menú semanal de Lunes a Domingo con las comidas especificadas.`,
    `Usa el patrón de comidas: ${config.meal_pattern.replace(/_/g, " ")}`,
    config.include_snacks ? "Incluye snacks entre comidas." : "",
    "",
    "Formato JSON:",
    `{
  "days": [
    {
      "day": "Lunes",
      "meals": [
        {
          "type": "desayuno",
          "dish_name": "...",
          "calories": 300,
          "protein_g": 15,
          "carbs_g": 40,
          "fiber_g": 5,
          "portions": "1 porción",
          "ingredients": [{"name": "...", "amount": 100, "unit": "g"}],
          "recipe_steps": ["Paso 1..."]
        }
      ],
      "snacks": []
    }
  ]
}`,
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await ai.chat(userPrompt, systemPrompt);
  const cleaned = raw.replace(/```(json)?/g, "").trim();
  let parsed: { days: unknown[] };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const retry = await ai.chat(
      "Corrige: devuelve SOLO JSON válido, nada más. " + cleaned,
      "Eres un asistente que solo devuelve JSON."
    );
    const retryCleaned = retry.replace(/```(json)?/g, "").trim();
    parsed = JSON.parse(retryCleaned);
  }

  const menu = await createMenu({
    name,
    config_snapshot: config,
    cuisine_overrides: cuisines,
    difficulty,
    pantry,
  });

  const days = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
  ];

  interface DayData { day: string; meals: any[]; snacks: any[]; }
  for (const dayData of parsed.days as DayData[]) {
    const dayIndex = days.indexOf(dayData.day);
    if (dayIndex === -1) continue;

    for (const meal of dayData.meals || []) {
      await insertMeal({
        menu_id: menu.id,
        day_index: dayIndex,
        meal_type: meal.type,
        dish_name: meal.dish_name,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fiber_g: meal.fiber_g,
        portions: meal.portions,
        ingredients: meal.ingredients,
        recipe_steps: meal.recipe_steps,
      });
    }

    for (const snack of dayData.snacks || []) {
      await insertMeal({
        menu_id: menu.id,
        day_index: dayIndex,
        meal_type: snack.type || "snack",
        is_snack: true,
        dish_name: snack.dish_name,
        calories: snack.calories,
        protein_g: snack.protein_g,
        carbs_g: snack.carbs_g,
        fiber_g: snack.fiber_g,
        portions: snack.portions,
        ingredients: snack.ingredients,
        recipe_steps: snack.recipe_steps,
      });
    }
  }

  const fullMenu = await getMenu(menu.id);
  res.status(201).json(fullMenu);
});

router.post("/:id/swap-meal", async (req, res) => {
  const menuId = Number(req.params.id);
  const { dayIndex, mealType, preferredIngredients, cravings, avoidIngredients } =
    swapMealSchema.parse(req.body);

  const menu = await getMenu(menuId);
  if (!menu) {
    res.status(404).json({ error: "Menú no encontrado" });
    return;
  }

  const currentMeal = menu.meals.find(
    (m: any) => m.day_index === dayIndex && m.meal_type === mealType
  );

  if (!currentMeal) {
    res.status(404).json({ error: "Comida no encontrada en ese día" });
    return;
  }

  const config = menu.config_snapshot || (await getConfig());

  const systemPrompt = [
    "Eres un chef nutricionista.",
    `Contexto del usuario: ${buildProfileContext(config)}`,
  ].join("\n");

  const userPrompt = [
    `Reemplaza la comida "${mealType}" del día índice ${dayIndex}.`,
    `Plato actual: "${currentMeal.dish_name}"`,
    preferredIngredients?.length
      ? `Ingredientes deseados: ${preferredIngredients.join(", ")}`
      : "",
    cravings ? `Antojo: ${cravings}` : "",
    avoidIngredients?.length
      ? `Evitar: ${avoidIngredients.join(", ")}`
      : "",
    `Perfil nutricional similar: ${currentMeal.calories}kcal, P:${currentMeal.protein_g}g, C:${currentMeal.carbs_g}g, F:${currentMeal.fiber_g}g`,
    "",
    "Formato JSON: { dish_name, calories, protein_g, carbs_g, fiber_g, portions, ingredients, recipe_steps }",
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await ai.chat(userPrompt, systemPrompt);
  const cleaned = raw.replace(/```(json)?/g, "").trim();
  const newMeal = JSON.parse(cleaned);

  const updated = await updateMeal(currentMeal.id, {
    dish_name: newMeal.dish_name,
    calories: newMeal.calories,
    protein_g: newMeal.protein_g,
    carbs_g: newMeal.carbs_g,
    fiber_g: newMeal.fiber_g,
    portions: newMeal.portions,
    ingredients: newMeal.ingredients ? JSON.stringify(newMeal.ingredients) : null,
    recipe_steps: newMeal.recipe_steps || null,
    swap_count: (currentMeal.swap_count || 0) + 1,
    original_dish_name: currentMeal.original_dish_name || currentMeal.dish_name,
  });

  res.json(updated);
});

router.put("/:menuId/meals/:mealId", async (req, res) => {
  const updated = await updateMeal(Number(req.params.mealId), req.body);
  res.json(updated);
});

router.put("/:menuId/meals/:mealId/rate", async (req, res) => {
  const { rating } = rateMealSchema.parse(req.body);
  const updated = await rateMeal(Number(req.params.mealId), rating);
  res.json(updated);
});

export default router;
