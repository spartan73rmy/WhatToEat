import { ollamaService } from "./ollamaService";
import pool from "../db/pool";
import { getConfig } from "../db/queries";

function extractJson(raw: string): string {
  const jsonStart = raw.indexOf('{');
  const arrayStart = raw.indexOf('[');
  const start = jsonStart === -1 ? arrayStart : arrayStart === -1 ? jsonStart : Math.min(jsonStart, arrayStart);
  if (start === -1) throw new Error("No se encontró JSON en la respuesta de la IA");
  const end = raw[start] === '[' ? raw.lastIndexOf(']') : raw.lastIndexOf('}');
  if (end === -1) throw new Error("JSON mal formado en la respuesta de la IA");
  return raw.slice(start, end + 1);
}

export async function generateMenu(params: {
  name: string;
  cuisines?: string[];
  difficulty?: string;
  pantry?: string[];
  profileOverrides?: Record<string, unknown>;
}) {
  const config = await getConfig();

  const mealTypes = config.meal_pattern === "3_comidas"
    ? "desayuno, comida, cena"
    : config.meal_pattern === "4_comidas"
    ? "desayuno, almuerzo, comida, cena"
    : "desayuno, almuerzo, comida, merienda, cena";

  const systemPrompt = `Eres un chef nutricionista especializado en menús personalizados.
RESPONDES ÚNICAMENTE con JSON válido, sin texto adicional.
RESPONDES EN ESPAÑOL. Todos los nombres de platillos, ingredientes y pasos deben estar en español.

Datos del usuario:
- Edad: ${config.age}, Género: ${config.gender}
- Estilo de vida: ${config.activity}
- Objetivo: ${config.goal} con déficit calórico de ${config.calorie_deficit} kcal/día
- Límite calórico diario: ${config.calorie_limit} kcal
- Distribución: ${config.meal_pattern}
- Snacks entre comidas: ${config.include_snacks ? "Sí" : "No"}
- Cocinas: ${(params.cuisines || config.default_cuisines || []).join(", ") || "variadas"}
- Dificultad: ${params.difficulty || "media"}
- Balance: Proteína ~25% | Carbohidratos ~50% | Fibra ~25%${params.pantry?.length ? `\n- Ingredientes disponibles: ${params.pantry.join(", ")}` : ""}

Reglas:
- NO repetir platillos en la misma semana
- Incluir porciones, ingredientes con cantidades, y pasos de receta
- CADA DÍA debe incluir EXACTAMENTE TODAS estas comidas: ${mealTypes}${config.include_snacks ? ", más 1 snack" : ""}
- No omitas ninguna comida. Cada día debe tener ${config.meal_pattern === "3_comidas" ? "3 comidas" : config.meal_pattern === "4_comidas" ? "4 comidas" : "5 comidas"}${config.include_snacks ? " más 1 snack" : ""}`;

  const userPrompt = `Genera un menú semanal de Lunes a Domingo.
CADA DÍA debe incluir TODAS las comidas: ${mealTypes}${config.include_snacks ? ", más 1 snack por día" : ""}.
NO omitas ninguna comida. Debes generar un platillo diferente para cada tipo de comida cada día.

Formato JSON (sigue EXACTAMENTE esta estructura con TODAS las comidas en cada día):
{
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
          "recipe_steps": ["Paso 1...", "Paso 2..."]
        },
        {
          "type": "comida",
          "dish_name": "...",
          "calories": 500,
          "protein_g": 30,
          "carbs_g": 50,
          "fiber_g": 8,
          "portions": "1 plato",
          "ingredients": [{"name": "...", "amount": 200, "unit": "g"}],
          "recipe_steps": ["Paso 1...", "Paso 2..."]
        },
        {
          "type": "cena",
          "dish_name": "...",
          "calories": 350,
          "protein_g": 25,
          "carbs_g": 30,
          "fiber_g": 6,
          "portions": "1 porción",
          "ingredients": [{"name": "...", "amount": 150, "unit": "g"}],
          "recipe_steps": ["Paso 1...", "Paso 2..."]
        }
      ],
      "snacks": []
    }
  ]
}

IMPORTANTE: Debes generar TODOS los 7 días (Lunes a Domingo) y cada día con TODAS sus comidas. No repitas platillos en la misma semana.`;

  const raw = await ollamaService.chat(userPrompt, systemPrompt);
  const parsed = JSON.parse(extractJson(raw));

  const menuRes = await pool.query(
    `INSERT INTO weekly_menus (name, config_snapshot, cuisine_overrides, difficulty, pantry)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      params.name,
      JSON.stringify(config),
      params.cuisines || config.default_cuisines,
      params.difficulty || "media",
      params.pantry || [],
    ]
  );
  const menu = menuRes.rows[0];

  for (const day of parsed.days) {
    const dayIndex = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].indexOf(day.day);
    if (dayIndex === -1) continue;

    for (const meal of day.meals) {
      await pool.query(
        `INSERT INTO meals (menu_id, day_index, meal_type, dish_name, calories, protein_g, carbs_g, fiber_g, portions, ingredients, recipe_steps)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          menu.id,
          dayIndex,
          meal.type,
          meal.dish_name,
          meal.calories,
          meal.protein_g,
          meal.carbs_g,
          meal.fiber_g,
          meal.portions,
          JSON.stringify(meal.ingredients || []),
          meal.recipe_steps || [],
        ]
      );
    }

    for (const snack of day.snacks || []) {
      await pool.query(
        `INSERT INTO meals (menu_id, day_index, meal_type, is_snack, dish_name, calories, protein_g, carbs_g, fiber_g, portions, ingredients, recipe_steps)
         VALUES ($1, $2, 'snack', TRUE, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          menu.id,
          dayIndex,
          snack.dish_name,
          snack.calories,
          snack.protein_g || 0,
          snack.carbs_g || 0,
          snack.fiber_g || 0,
          snack.portions || "1 porción",
          JSON.stringify(snack.ingredients || []),
          snack.recipe_steps || [],
        ]
      );
    }
  }

  const mealsRes = await pool.query("SELECT * FROM meals WHERE menu_id = $1 ORDER BY day_index, meal_type", [menu.id]);
  return { ...menu, meals: mealsRes.rows };
}

export async function swapMeal(menuId: number, params: {
  dayIndex: number;
  mealType: string;
  preferredIngredients?: string;
  cravings?: string;
  avoidIngredients?: string;
}) {
  const mealRes = await pool.query(
    "SELECT * FROM meals WHERE menu_id = $1 AND day_index = $2 AND meal_type = $3",
    [menuId, params.dayIndex, params.mealType]
  );
  const currentMeal = mealRes.rows[0];
  if (!currentMeal) throw new Error("Comida no encontrada");

  const menuRes = await pool.query("SELECT * FROM weekly_menus WHERE id = $1", [menuId]);
  const menu = menuRes.rows[0];
  if (!menu) throw new Error("Menú no encontrado");

  const config = menu.config_snapshot || {};

  const systemPrompt = `Eres un chef nutricionista.
RESPONDES EN ESPAÑOL. Todos los nombres, ingredientes y pasos en español.
RESPONDES ÚNICAMENTE con JSON válido.

Contexto del usuario: ${JSON.stringify(config)}`;

  const userPrompt = `En el menú del día ${["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][params.dayIndex]}, reemplaza la ${params.mealType} actual ("${currentMeal.dish_name}").
${params.preferredIngredients ? `\nIngredientes que quiere: ${params.preferredIngredients}` : ""}${params.cravings ? `\nAntojo: ${params.cravings}` : ""}${params.avoidIngredients ? `\nEvitar: ${params.avoidIngredients}` : ""}

Perfil nutricional similar al plato original (${currentMeal.calories}kcal, P:${currentMeal.protein_g}g, C:${currentMeal.carbs_g}g, F:${currentMeal.fiber_g}g).

Formato JSON:
{
  "dish_name": "...",
  "calories": ${currentMeal.calories},
  "protein_g": ${currentMeal.protein_g},
  "carbs_g": ${currentMeal.carbs_g},
  "fiber_g": ${currentMeal.fiber_g},
  "portions": "${currentMeal.portions || "1 porción"}",
  "ingredients": [{"name": "...", "amount": 100, "unit": "g"}],
  "recipe_steps": ["Paso 1...", "Paso 2..."]
}`;

  const raw = await ollamaService.chat(userPrompt, systemPrompt);
  const newMeal = JSON.parse(extractJson(raw));

  const updated = await pool.query(
    `UPDATE meals SET dish_name = $1, calories = $2, protein_g = $3, carbs_g = $4, fiber_g = $5,
     portions = $6, ingredients = $7, recipe_steps = $8, swap_count = swap_count + 1,
     original_dish_name = COALESCE(original_dish_name, dish_name)
     WHERE id = $9 RETURNING *`,
    [
      newMeal.dish_name,
      newMeal.calories,
      newMeal.protein_g,
      newMeal.carbs_g,
      newMeal.fiber_g,
      newMeal.portions,
      JSON.stringify(newMeal.ingredients || []),
      newMeal.recipe_steps || [],
      currentMeal.id,
    ]
  );

  return updated.rows[0];
}

export async function exploreDishes(params: { page: number; excludeDishes: string[] }) {
  const config = await getConfig();

  const systemPrompt = `Eres un chef creativo. RESPONDES EN ESPAÑOL.
RESPONDES ÚNICAMENTE con un JSON array de platillos, sin texto adicional.

Basado en este perfil: ${JSON.stringify(config)}

Genera 10 platillos variados que este usuario podría disfrutar.
NO incluyas estos platillos ya mostrados anteriormente: ${(params.excludeDishes || []).join(", ")}
Cada platillo debe ser único.`;

  const userPrompt = `Genera 10 platillos variados.

Formato JSON:
[
  {
    "dish_name": "...",
    "meal_type": "comida",
    "calories": 350,
    "protein_g": 20,
    "carbs_g": 30,
    "fiber_g": 5,
    "ingredients": [{"name": "...", "amount": 100, "unit": "g"}],
    "recipe_steps": ["Paso 1..."]
  }
]`;

  const raw = await ollamaService.chat(userPrompt, systemPrompt);
  return JSON.parse(extractJson(raw));
}

export async function suggestCuisines() {
  const config = await getConfig();

  const systemPrompt = `RESPONDES EN ESPAÑOL.
Recomienda tipos de cocina ideales para este perfil:
- ${config.gender}, ${config.age} años, ${config.activity}
- Objetivo: ${config.goal} con déficit calórico de ${config.calorie_deficit} kcal
- Cocina rápida (<30 min preparación)
- Ingredientes accesibles, platillos bajos en calorías
- Sabores que satisfacen sin exceder calorías

Responde ÚNICAMENTE un JSON array de strings con 3 a 5 cocinas.
Ejemplo: ["Mexicana", "Japonesa", "Mediterránea"]`;

  const raw = await ollamaService.chat("¿Qué cocinas me recomiendas?", systemPrompt);
  return JSON.parse(extractJson(raw));
}
