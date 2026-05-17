import "dotenv/config";
import pool from "./pool";

const sql = `
CREATE TABLE IF NOT EXISTS user_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  age INTEGER NOT NULL DEFAULT 28,
  gender TEXT NOT NULL DEFAULT 'mujer',
  activity TEXT NOT NULL DEFAULT 'sedentaria',
  goal TEXT NOT NULL DEFAULT 'bajar_peso',
  calorie_deficit INTEGER NOT NULL DEFAULT 500,
  meal_pattern TEXT NOT NULL DEFAULT '4_comidas',
  include_snacks BOOLEAN DEFAULT TRUE,
  breakfast_intensity TEXT DEFAULT 'ligero',
  almuerzo_intensity TEXT DEFAULT 'normal',
  comida_intensity TEXT DEFAULT 'sustancioso',
  merienda_intensity TEXT DEFAULT 'normal',
  cena_intensity TEXT DEFAULT 'ligero',
  calorie_limit INTEGER NOT NULL DEFAULT 1400,
  default_cuisines TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_menus (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  config_snapshot JSONB,
  cuisine_overrides TEXT[],
  difficulty TEXT,
  pantry TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER REFERENCES weekly_menus(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  meal_type TEXT NOT NULL,
  is_snack BOOLEAN DEFAULT FALSE,
  dish_name TEXT NOT NULL,
  calories INTEGER,
  protein_g DECIMAL(5,1),
  carbs_g DECIMAL(5,1),
  fiber_g DECIMAL(5,1),
  portions TEXT,
  ingredients JSONB,
  recipe_steps TEXT[],
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  swap_count INTEGER DEFAULT 0,
  original_dish_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_meal_per_day UNIQUE (menu_id, day_index, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_meals_rating ON meals(user_rating);
CREATE INDEX IF NOT EXISTS idx_meals_created ON meals(created_at);

CREATE TABLE IF NOT EXISTS favorite_dishes (
  id SERIAL PRIMARY KEY,
  dish_name TEXT NOT NULL,
  cuisine TEXT,
  meal_type TEXT,
  calories INTEGER,
  protein_g DECIMAL(5,1),
  carbs_g DECIMAL(5,1),
  fiber_g DECIMAL(5,1),
  portions TEXT,
  ingredients JSONB,
  recipe_steps TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO user_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE weekly_menus ADD COLUMN IF NOT EXISTS price_category TEXT;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("Migration completed successfully");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
