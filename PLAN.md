# Plan de Arquitectura — WhatToEat

Aplicación web para generar menús semanales personalizados con IA (Ollama), control calórico y balance nutricional.

---

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Frontend** | React 18 + Vite | UI moderna con HMR rápido |
| | Tailwind CSS | Estilos utilitarios |
| | Framer Motion | Animación del cinnamon roll |
| | TanStack React Query | Fetch, caché, estado del servidor |
| | React Router v7 | Navegación SPA |
| | lucide-react | Iconos |
| | react-infinite-scroll-component | Scroll infinito en explorar |
| **Backend** | Express.js | HTTP server |
| | pg (node-postgres) | Conexión PostgreSQL |
| | zod | Validación de schemas |
| | cors + helmet | Seguridad |
| | dotenv | Config vars |
| | (fetch nativo Node 24+) | Llamadas HTTP a Ollama |
| **IA Local** | Ollama + qwen3.5 (9B) | Generación de menús y sugerencias en español |
| **Base de Datos** | PostgreSQL | Persistencia |

---

## Estructura del Proyecto

```
WhatToEat/
├── client/                          # React + Vite
│   ├── public/
│   │   └── cinnamon-roll.svg        # SVG del cinnamon roll
│   ├── src/
│   │   ├── api/
│   │   │   ├── configApi.ts
│   │   │   ├── menuApi.ts
│   │   │   ├── exploreApi.ts
│   │   │   └── favoritesApi.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── CinnamonRoll.tsx
│   │   │   ├── config/
│   │   │   │   ├── ProfileForm.tsx
│   │   │   │   ├── MealDistributionPicker.tsx
│   │   │   │   ├── IntensitySelector.tsx
│   │   │   │   └── CalorieSlider.tsx
│   │   │   ├── menus/
│   │   │   │   ├── MenuCard.tsx
│   │   │   │   ├── CreateMenuModal.tsx
│   │   │   │   ├── WeeklyGrid.tsx
│   │   │   │   ├── MealCard.tsx
│   │   │   │   ├── SwapModal.tsx
│   │   │   │   ├── RatingStars.tsx
│   │   │   │   ├── AddToMenuModal.tsx
│   │   │   │   └── EditMealModal.tsx
│   │   │   ├── explore/
│   │   │   │   ├── ExploreGrid.tsx
│   │   │   │   └── DishCard.tsx
│   │   │   └── favorites/
│   │   │       └── FavoriteCard.tsx
│   │   ├── hooks/
│   │   │   ├── useConfig.ts
│   │   │   ├── useMenus.ts
│   │   │   ├── useExplore.ts
│   │   │   └── useFavorites.ts
│   │   ├── pages/
│   │   │   ├── ConfigPage.tsx
│   │   │   ├── MenusPage.tsx
│   │   │   ├── MenuDetailPage.tsx
│   │   │   ├── ExplorePage.tsx
│   │   │   └── FavoritesPage.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Express.js
│   ├── src/
│   │   ├── routes/
│   │   │   ├── configRoutes.ts
│   │   │   ├── menuRoutes.ts
│   │   │   ├── exploreRoutes.ts
│   │   │   ├── favoritesRoutes.ts
│   │   │   └── aiRoutes.ts
│   │   ├── services/
│   │   │   ├── ollamaService.ts     # Prompts + comunicación con Ollama
│   │   │   ├── menuService.ts
│   │   │   ├── configService.ts
│   │   │   └── exploreService.ts
│   │   ├── db/
│   │   │   ├── pool.ts
│   │   │   ├── migrate.ts           # Creación de tablas
│   │   │   └── queries.ts
│   │   ├── validators/
│   │   │   └── schemas.ts           # Zod schemas
│   │   └── index.ts                 # Entry point
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
├── .env                             # Variables de entorno
├── PLAN.md                          # Este archivo
├── README.md
├── LICENSE                          # Apache 2.0
└── package.json                     # Monorepo workspaces
```

---

## Base de Datos

### Diagrama de Tablas

```
┌──────────────────────────┐
│       user_config         │  (singleton — siempre id=1)
├──────────────────────────┤
│ id: 1 (CHECK constraint) │
│ age                      │
│ gender                   │
│ activity                 │
│ goal                     │
│ calorie_deficit          │
│ meal_pattern             │
│ include_snacks           │
│ breakfast_intensity       │
│ almuerzo_intensity       │
│ comida_intensity         │
│ merienda_intensity       │
│ cena_intensity           │
│ calorie_limit            │
│ default_cuisines[]       │
│ updated_at               │
└──────────┬───────────────┘
            │ (no FK — se lee directamente)
            │
┌───────────┴───────────────┐
│       weekly_menus         │
├───────────────────────────┤
│ id (PK)                   │
│ name                      │
│ config_snapshot (JSONB)   │ ← copia de user_config al generar
│ cuisine_overrides (TEXT[])│
│ difficulty                │
│ pantry (TEXT[])            │
│ created_at                │
└───────────┬───────────────┘
            │ 1:N
            ▼
┌───────────────────────────┐
│          meals             │
├───────────────────────────┤
│ id (PK)                   │
│ menu_id (FK → menus)      │
│ day_index (0-6)           │
│ meal_type (TEXT)          │
│ is_snack (BOOLEAN)        │
│ dish_name                 │
│ calories                  │
│ protein_g / carbs_g /     │
│ fiber_g                   │
│ portions                  │
│ ingredients (JSONB)       │
│ recipe_steps (TEXT[])     │
│ user_rating (1-5)         │
│ swap_count                │
│ original_dish_name        │
│ created_at                │
└───────────────────────────┘

┌───────────────────────────┐
│     favorite_dishes        │
├───────────────────────────┤
│ id (PK)                   │
│ dish_name                 │
│ cuisine                   │
│ meal_type                 │
│ calories / protein_g /    │
│ carbs_g / fiber_g         │
│ portions                  │
│ ingredients (JSONB)       │
│ recipe_steps (TEXT[])     │
│ notes                     │
│ created_at                │
└───────────────────────────┘
```

### SQL de Creación

```sql
CREATE TABLE user_config (
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

CREATE TABLE weekly_menus (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  config_snapshot JSONB,
  cuisine_overrides TEXT[],
  difficulty TEXT,
  pantry TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meals (
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

CREATE INDEX idx_meals_rating ON meals(user_rating);
CREATE INDEX idx_meals_created ON meals(created_at);

CREATE TABLE favorite_dishes (
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
```

---

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/config` | Obtener config global |
| `PUT` | `/api/config` | Actualizar config global (reemplazo completo) |
| `GET` | `/api/menus` | Listar todos los menús |
| `POST` | `/api/menus` | Crear menú vacío (body: `{ name }`) |
| `GET` | `/api/menus/:id` | Menú completo con todas sus meals |
| `POST` | `/api/menus/generate` | **Generar menú con IA** — recibe config opcional + cuisines + difficulty + pantry, llama a Ollama, guarda, actualiza config global si hay cambios |
| `POST` | `/api/menus/:id/swap-meal` | Reemplazar comida vía IA — body: `{ dayIndex, mealType, preferredIngredients?, cravings?, avoidIngredients? }` |
| `PUT` | `/api/menus/:id/meals/:mealId` | Editar comida manualmente |
| `PUT` | `/api/menus/:id/meals/:mealId/rate` | Puntuar comida — body: `{ rating: 1-5 }` |
| `DELETE` | `/api/menus/:id` | Eliminar menú (cascade meals) |
| `POST` | `/api/explore` | **Explorar platillos** — body: `{ page, excludeDishes[] }` — llama a Ollama, devuelve 10 platillos nuevos |
| `POST` | `/api/explore/add-to-menu` | Agregar platillo explorado a un menú — body: `{ menuId, dayIndex, mealType, dish }` |
| `GET` | `/api/favorites` | Listar favoritos |
| `POST` | `/api/favorites` | Guardar favorito — body: dish completo |
| `DELETE` | `/api/favorites/:id` | Quitar favorito |
| `POST` | `/api/ai/suggest-cuisines` | **IA sugiere cocinas** según perfil — llama a Ollama, devuelve `string[]` |

### Handler: Generar Menú (`POST /api/menus/generate`)

```
1. Recibir body: { name, cuisines, difficulty, pantry, profileOverrides? }
2. Leer user_config actual
3. Merge: si hay profileOverrides, aplicarlos y guardarlos en user_config
4. Consultar meals con rating ≥ 4 de hace > 1 mes para re-sugerencia
5. Construir prompt para Ollama con:
   - Datos completos del perfil
   - Cocinas seleccionadas
   - Dificultad
   - Ingredientes en despensa
   - Platillos que el usuario disfrutó (elegibles para re-sugerir)
6. Llamar a POST http://localhost:11434/api/chat con modelo qwen2.5:7b
7. Parsear respuesta JSON
8. Guardar en weekly_menus + meals
9. Devolver menú creado
```

### Handler: Swap Meal (`POST /api/menus/:id/swap-meal`)

```
1. Recibir: { dayIndex, mealType, preferredIngredients?, cravings?, avoidIngredients? }
2. Obtener meal actual de la BD
3. Construir prompt con contexto del perfil (del config_snapshot del menú)
4. Incluir: plato actual, preferencias, antojos, ingredientes a evitar
5. Llamar a Ollama
6. Parsear JSON del nuevo platillo
7. Actualizar meal en BD (incrementar swap_count, mantener original_dish_name)
8. Devolver meal actualizada
```

### Handler: Explorar (`POST /api/explore`)

```
1. Recibir: { page, excludeDishes[] }
2. Leer user_config
3. Construir prompt: "Genera 10 platillos variados. NO incluyas: [...excludeDishes]"
4. Llamar a Ollama
5. Devolver array de platillos
```

### Handler: Sugerir Cocinas (`POST /api/ai/suggest-cuisines`)

```
1. Leer user_config
2. Prompt: "Recomienda 3-5 cocinas ideales para: mujer 28, sedentaria, bajar de peso, déficit 500kcal"
3. Llamar a Ollama
4. Devolver string[]
```

---

## Frontend: Rutas y Vistas

| Ruta | Página | Descripción |
|---|---|---|
| `/` | `ConfigPage` | Configuración global del usuario |
| `/menus` | `MenusPage` | Lista de menús generados + botón "Nuevo Menú" |
| `/menus/:id` | `MenuDetailPage` | Vista semanal del menú completo |
| `/explore` | `ExplorePage` | Explorar platillos nuevos (infinite scroll) |
| `/favorites` | `FavoritesPage` | Platillos guardados como favoritos |

### Navegación

```
┌──────────────────────────────────────────────────────────────┐
│                    Navbar                                    │
│  [⚙ Config]  [📋 Menús]  [🔍 Explorar]  [❤ Favoritos]      │
├──────────────────────────────────────────────────────────────┤
│                         Page content                         │
├──────────────────────────────────────────────────────────────┤
│  🥮 Cinnamon Roll animado (Framer Motion)                   │
│  ← se desplaza lentamente, al hover "muerde" →               │
└──────────────────────────────────────────────────────────────┘
```

### Vista: ConfigPage (`/`)

```
┌────────────────────────────────────────────────────────────┐
│  Configuración General                                      │
├────────────────────────────────────────────────────────────┤
│  👤 Perfil                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Edad: [28]    Género: [Mujer ▼]                     │   │
│  │ Actividad: [Sedentaria ▼]                           │   │
│  │ Objetivo: [Bajar de peso ▼]                         │   │
│  │ Déficit: [500 kcal ▼]                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  🍽 Distribución                                            │
│  ○ 3 comidas  ● 4 comidas  ○ 5 comidas  ☑ Snacks          │
│                                                            │
│  📊 Intensidad                                              │
│  Desayuno: [Ligero ▼]  Almuerzo: [Normal ▼]               │
│  Comida: [Sustancioso ▼]  Cena: [Ligero ▼]                │
│                                                            │
│  🔥 Límite calórico: ═══●═══════════ 1400 kcal            │
│                                                            │
│  🥘 Cocinas preferidas                                      │
│  ☑ Japonesa  ☐ Mexicana  ☐ Italiana  ...                  │
│  [✨ Sugerir cocinas con IA]                                │
│                                                            │
│  ↻ Se guarda automáticamente                                │
└────────────────────────────────────────────────────────────┘
```

### Vista: MenuDetailPage (`/menus/:id`)

```
┌──────────────────────────────────────────────────────────────┐
│  Semana 1       [⚙ Ajustar] [🗑 Eliminar]                   │
├──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  Día     │ Desayuno │ Almuerzo │ Comida   │ Cena     │      │
├──────────┼──────────┼──────────┼──────────┼──────────┤      │
│  Lunes   │ Avena    │ ─        │ Pollo    │ Ensalada │      │
│          │ 250 kcal │          │ 550 kcal │ 180 kcal │      │
│          │ ⭐⭐⭐☆☆  │          │ ⭐⭐⭐⭐☆ │ ⭐⭐☆☆☆  │      │
│          │ [🔄]     │          │ [🔄]     │ [🔄]     │      │
│          │ 📖 receta│          │          │          │      │
├──────────┼──────────┼──────────┼──────────┼──────────┤      │
│  Martes  │ ...      │ ...      │ ...      │ ...      │      │
└──────────┴──────────┴──────────┴──────────┴──────────┘      │
🥜 Snacks: Lunes: Fruta (80kcal) | Martes: Yogurt (120kcal)
```

**Modal Swap (al hacer clic en 🔄):**

```
┌──────────────────────────────────┐
│  Reemplazar Comida               │
│  ────────────────────────        │
│  Plato actual: Pollo al horno    │
│                                  │
│  Ingredientes que quiero:        │
│  [pollo, verduras          ]     │
│  Antojo:                          │
│  [algo con salsa verde     ]     │
│  Evitar:                         │
│  [lácteos                  ]     │
│                                  │
│  [🔄 Sugerir nuevo platillo]     │
└──────────────────────────────────┘
```

### Vista: ExplorePage (`/explore`)

```
┌──────────────────────────────────────────────────────────────┐
│  🔍 Explorar — Basado en tu perfil                          │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Ensalada │  │ Rollos   │  │ Tacos de │                   │
│  │ César    │  │ sushi    │  │ lentejas │                   │
│  │ 320 kcal │  │ 280 kcal │  │ 350 kcal │                   │
│  │ [➕][❤]  │  │ [➕][❤]  │  │ [➕][❤]  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Sopa     │  │ Bowl     │  │ Pescado  │                   │
│  │ miso     │  │ quinoa   │  │ horno    │                   │
│  │ 180 kcal │  │ 420 kcal │  │ 380 kcal │                   │
│  │ [➕][❤]  │  │ [➕][❤]  │  │ [➕][❤]  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│  ──────── Cargando más platillos... ────────                 │
└──────────────────────────────────────────────────────────────┘
```

- **[➕]** → Abre `AddToMenuModal`: selecciona menú, día y tipo de comida
- **[❤]** → Guarda en `favorite_dishes`

---

## Prompt Engineering

### Prompt: Generar Menú

```
System: Eres un chef nutricionista especializado en menús personalizados.
Respondes ÚNICAMENTE con JSON válido, sin texto adicional.
RESPONDES EN ESPAÑOL. Todos los nombres de platillos, ingredientes y pasos deben estar en español.

Datos del usuario:
- Edad: {age}, Género: {gender}
- Estilo de vida: {activity}
- Objetivo: {goal} con déficit calórico de {deficit} kcal/día
- Límite calórico diario: {calorieLimit} kcal
- Distribución: {pattern} ({intensities})
- Snacks entre comidas: {includeSnacks}
- Cocinas: {cuisines}
- Dificultad: {difficulty}
- Balance: Proteína ~25% | Carbohidratos ~50% | Fibra ~25%
- Ingredientes disponibles: {pantry}

Reglas:
- NO repetir platillos en la misma semana
- Incluir porciones, ingredientes con cantidades, y pasos de receta
- Si el usuario ya calificó platillos antes (hace ≥1 mes), puedes re-sugerirlos:
  {previousHighRated}

User: Genera un menú semanal de Lunes a Domingo.

Formato JSON:
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
        }
      ],
      "snacks": []
    }
  ]
}
```

### Prompt: Swap Meal

```
System: Eres un chef nutricionista. Contexto del usuario: {profileContext}
RESPONDES EN ESPAÑOL. Todos los nombres, ingredientes y pasos en español.

User: En el menú del día {day}, reemplaza la {mealType}
actual ("{currentDish}").

Preferencias para el nuevo plato:
- Ingredientes: {preferredIngredients}
- Antojo: {cravings}
- Evitar: {avoidIngredients}

Perfil nutricional similar al plato original ({calories}kcal, P:{protein}g, C:{carbs}g, F:{fiber}g).

Formato JSON:
{
  "dish_name": "...",
  "calories": ...,
  "protein_g": ...,
  "carbs_g": ...,
  "fiber_g": ...,
  "portions": "...",
  "ingredients": [...],
  "recipe_steps": [...]
}
```

### Prompt: Sugerir Cocinas

```
System: RESPONDES EN ESPAÑOL. Recomienda tipos de cocina ideales para este perfil:
- Mujer, {age} años, sedentaria
- Objetivo: bajar de peso con déficit calórico
- Cocina rápida (<30 min preparación)
- Ingredientes accesibles, platillos bajos en calorías
- Sabores que satisfacen sin exceder calorías

Responde ÚNICAMENTE un JSON array de strings con 3 a 5 cocinas.

User: ¿Qué cocinas me recomiendas?
```

### Prompt: Explorar

```
System: {profileContext}
RESPONDES EN ESPAÑOL. Todos los nombres y descripciones en español.

Genera 10 platillos variados que este usuario podría disfrutar.
NO incluyas estos platillos ya mostrados anteriormente:
{excludeList}

Variedad en tipos de comida, ingredientes y técnicas.
Cada platillo debe ser único e incluir información nutricional aproximada.

Formato JSON array:
[
  {
    "dish_name": "...",
    "meal_type": "comida",
    "calories": ...,
    "protein_g": ...,
    "carbs_g": ...,
    "fiber_g": ...,
    "ingredients": [{"name": "...", "amount": ..., "unit": "g"}],
    "recipe_steps": ["Paso 1..."]
  }
]
```

---

## Integración con Ollama

**Opción seleccionada:** Backend proxy vía `node-fetch`

```
React → POST /api/menus/generate → Express → ollamaService.ts → fetch("http://localhost:11434/api/chat") → Ollama
```

El backend encapsula toda la lógica de comunicación con Ollama en `ollamaService.ts`:

```typescript
// server/src/services/ollamaService.ts
class OllamaService {
  private baseUrl = "http://localhost:11434";
  private model = "qwen3.5";

  async chat(prompt: string, systemPrompt: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: false,
        options: { temperature: 0.7 },
      }),
    });
    const data = await res.json();
    return data.message.content;
  }
}
```

**Ventajas de esta opción:**
- Ollama nunca se expone al frontend (seguridad)
- El backend puede cachear respuestas frecuentes
- Se puede agregar rate limiting y logging centralizado
- Fácil cambiar de modelo o proveedor de IA en el futuro
- Sin necesidad de configurar CORS en Ollama

---

## Re-sugerencia de Platillos (Ciclo Mensual)

1. Usuario puntúa platillos en el menú (⭐1-5)
2. `PUT /api/menus/:id/meals/:mealId/rate` guarda el rating
3. Al generar un nuevo menú, el backend ejecuta:
   ```sql
   SELECT dish_name, MAX(m.created_at) as last_eaten
   FROM meals m
   JOIN weekly_menus wm ON m.menu_id = wm.id
   WHERE m.user_rating >= 4
   GROUP BY dish_name
   HAVING MAX(m.created_at) < NOW() - INTERVAL '1 month'
   ```
4. Los platillos con alta puntuación y ≥1 mes sin comerse se pasan al prompt como elegibles para re-sugerencia

---

## Animación del Cinnamon Roll

**Tecnología:** Framer Motion + CSS

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                     🥮  →  →  →  →  →                       │
│          (se desplaza horizontalmente, loop infinito)        │
│                                                              │
│          hover → escala + bounce (simula mordida)             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Estados de animación:
- **idle**: translateX infinito, loop
- **hover**: `scale(1.2)` + `rotate(10deg)` + bounce
- **transition**: repeat Infinity, ease "linear" para scroll, spring para hover

---

## Flujo Completo del Usuario

```
1. PRIMERA VISITA
   ─► Abre la app
   ─► Ve pantalla de Configuración (vacía)
   ─► Llena sus datos (edad, género, etc.)
   ─► Selecciona cocinas preferidas (o usa "Sugerir con IA")
   ─► Config se guarda automáticamente

2. GENERAR MENÚ
   ─► Va a /menus
   ─► Click "Nuevo Menú"
   ─► Datos precargados desde config global
   ─► Puede modificar: cocinas, dificultad, calorías, despensa
   ─► Click "Generar con IA"
   ─► Espera ~5-15 segundos mientras Ollama genera
   ─► Ve el menú semanal completo

3. INTERACTUAR CON MENÚ
   ─► Expande una comida para ver receta
   ─► Puntúa platillos (⭐)
   ─► Si no le gusta algo, click "🔄 Swap"
   ─► Escribe preferencias para el reemplazo
   ─► IA genera nueva opción

4. EXPLORAR
   ─► Va a /explore
   ─► Ve platillos sugeridos por IA según su perfil
   ─► Scroll infinito para más opciones
   ─► Click "➕" para agregar a un menú existente
   ─► Click "❤" para guardar como favorito

5. FAVORITOS
   ─► Va a /favorites
   ─► Ve todos los platillos que ha guardado
   ─► Puede eliminarlos

6. CICLO MENSUAL
   ─► Al generar un nuevo menú, IA considera platillos
       que el usuario disfrutó hace ≥1 mes
   ─► Los platillos se re-sugieren naturalmente
```

---

## Consideraciones Técnicas

### Rendimiento
- Ollama en RTX 3060 4GB con qwen3.5 (6.6GB): el modelo no cabe completo en VRAM
- Ollama hace **offloading parcial**: capas se ejecutan en GPU (4GB) y el resto en CPU+RAM
- Generación estimada: ~5-15 tok/s (depende de la carga de CPU)
- Generación de menú completo: ~20-40 segundos
- El frontend debe mostrar un estado "Generando..." con el cinnamon roll animado y barra de progreso

### Errores y Timeouts
- Si Ollama no responde en 60s, backend retorna error 503 (qwen3.5 tarda más por offloading parcial)
- Si la respuesta de Ollama no es JSON válido, reintentar 1 vez con temperatura más baja
- Si el parseo falla, devolver error con mensaje amigable

### Seed de Datos
- Al iniciar la app por primera vez:
  1. Verificar si existe `user_config` (id=1), si no, insertar fila default
  2. Insertar algunas cocinas populares como lista de referencia

### Variables de Entorno (`.env`)
```
PORT=3001
DATABASE_URL=postgresql://postgres:Contra123@localhost:5432/whattoeat
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen3.5
CLIENT_URL=http://localhost:5173
```

---
