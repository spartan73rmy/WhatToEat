export interface UserConfig {
  id: number;
  age: number;
  gender: string;
  activity: string;
  goal: string;
  calorie_deficit: number;
  meal_pattern: string;
  include_snacks: boolean;
  breakfast_intensity: string;
  almuerzo_intensity: string;
  comida_intensity: string;
  merienda_intensity: string;
  cena_intensity: string;
  calorie_limit: number;
  default_cuisines: string[];
  updated_at: string;
}

export interface WeeklyMenu {
  id: number;
  name: string;
  config_snapshot: Record<string, unknown> | null;
  cuisine_overrides: string[];
  difficulty: string;
  pantry: string[];
  created_at: string;
  meals?: Meal[];
}

export interface Meal {
  id: number;
  menu_id: number;
  day_index: number;
  meal_type: string;
  is_snack: boolean;
  dish_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fiber_g: number;
  portions: string;
  ingredients: Ingredient[];
  recipe_steps: string[];
  user_rating: number | null;
  swap_count: number;
  original_dish_name: string;
  created_at: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface FavoriteDish {
  id: number;
  dish_name: string;
  cuisine: string;
  meal_type: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fiber_g: number;
  portions: string;
  ingredients: Ingredient[];
  recipe_steps: string[];
  notes: string;
  created_at: string;
}

export interface ExploreDish {
  dish_name: string;
  meal_type: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fiber_g: number;
  portions: string;
  ingredients: Ingredient[];
  recipe_steps: string[];
}

export const DAYS = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
];

export const CUISINES = [
  "mexicana", "japonesa", "italiana", "mediterránea", "china",
  "coreana", "india", "tailandesa", "francesa", "árabe",
  "vegetariana", "vegana", "peruana", "española", "otra",
] as const;
