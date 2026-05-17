import { z } from "zod";

export const updateConfigSchema = z.object({
  age: z.number().int().min(1).max(120).optional(),
  gender: z.enum(["mujer", "hombre", "otro"]).optional(),
  activity: z.enum(["sedentaria", "ligera", "moderada", "activa", "muy_activa"]).optional(),
  goal: z.enum(["bajar_peso", "mantener_peso", "subir_peso", "ganar_musculo"]).optional(),
  calorie_deficit: z.number().int().min(0).max(2000).optional(),
  meal_pattern: z.enum(["3_comidas", "4_comidas", "5_comidas"]).optional(),
  include_snacks: z.boolean().optional(),
  breakfast_intensity: z.enum(["ligero", "normal", "sustancioso"]).optional(),
  almuerzo_intensity: z.enum(["ligero", "normal", "sustancioso"]).optional(),
  comida_intensity: z.enum(["ligero", "normal", "sustancioso"]).optional(),
  merienda_intensity: z.enum(["ligero", "normal", "sustancioso"]).optional(),
  cena_intensity: z.enum(["ligero", "normal", "sustancioso"]).optional(),
  calorie_limit: z.number().int().min(500).max(5000).optional(),
  default_cuisines: z.array(z.string()).optional(),
});

export const generateMenuSchema = z.object({
  name: z.string().min(1),
  cuisines: z.array(z.string()).optional(),
  difficulty: z.enum(["facil", "media", "dificil"]).optional(),
  pantry: z.array(z.string()).optional(),
  profileOverrides: updateConfigSchema.partial().optional(),
});

export const swapMealSchema = z.object({
  dayIndex: z.number().int().min(0).max(6),
  mealType: z.string().min(1),
  preferredIngredients: z.string().optional(),
  cravings: z.string().optional(),
  avoidIngredients: z.string().optional(),
});

export const exploreSchema = z.object({
  page: z.number().int().min(1).default(1),
  excludeDishes: z.array(z.string()).default([]),
});

export const addToMenuSchema = z.object({
  menuId: z.number().int(),
  dayIndex: z.number().int().min(0).max(6),
  mealType: z.string().min(1),
  dish: z.object({
    dish_name: z.string().min(1),
    meal_type: z.string().optional(),
    calories: z.number().optional(),
    protein_g: z.number().optional(),
    carbs_g: z.number().optional(),
    fiber_g: z.number().optional(),
    portions: z.string().optional(),
    ingredients: z.array(z.any()).optional(),
    recipe_steps: z.array(z.string()).optional(),
  }),
});

export const favoriteSchema = z.object({
  dish_name: z.string().min(1),
  cuisine: z.string().optional(),
  meal_type: z.string().optional(),
  calories: z.number().optional(),
  protein_g: z.number().optional(),
  carbs_g: z.number().optional(),
  fiber_g: z.number().optional(),
  portions: z.string().optional(),
  ingredients: z.array(z.any()).optional(),
  recipe_steps: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
