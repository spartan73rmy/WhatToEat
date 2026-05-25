# 🥘 WhatToEat

**Generador de menús semanales personalizados con IA.**

WhatToEat es una aplicación web que utiliza IA (OpenRouter + DeepSeek V4 Flash) para crear menús semanales adaptados a tu perfil, objetivos nutricionales y preferencias culinarias. Controla calorías, balance de macronutrientes, y evita la repetición de platillos.

---

## ✨ Características

- **Configuración única de perfil** — Edad, género, actividad, objetivo (bajar de peso/mantener/aumentar masa) y déficit calórico. Se guarda una vez y se reusa en todas las generaciones.
- **Distribución de comidas flexible** — Elige entre 3, 4 o 5 comidas al día, con o sin snacks. Define la intensidad de cada comida (ligero/normal/sustancioso).
- **Generación de menú con IA** — OpenRouter + DeepSeek V4 Flash (modelo gratuito). Sin GPU requerida, sin configuración local de modelos.
- **Control calórico y macros** — Cada menú respeta un límite de calorías diarias y balance de proteína ~25%, carbohidratos ~50%, fibra ~25%.
- **Swap inteligente** — No te gusta un platillo? Reemplázalo con IA indicando ingredientes que quieras usar, antojos o alimentos a evitar.
- **Explorar platillos** — Descubre nuevas recetas con scroll infinito, todas generadas según tu perfil. Agrégalas a un menú o guárdalas como favoritas.
- **Sistema de puntuación** — Califica los platillos que pruebas. Después de ~1 mes, la IA puede re-sugerir tus favoritos.
- **Ingredientes en despensa** — Indica qué tienes en casa y la IA lo usará al generar el menú.
- **Sugerencia de cocinas con IA** — ¿No sabes qué tipo de cocina elegir? La IA te recomienda las más adecuadas para tu perfil.
- **Animación de cinnamon roll** — 🥮 Un cinnamon roll animado en el footer se desplaza horizontalmente y "muerde" al hacer hover.

---

## 🖥️ Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, TanStack React Query, React Router v7 |
| **Backend** | Express.js, node-postgres (pg), zod |
| **Base de Datos** | PostgreSQL |
| **IA** | OpenRouter API + DeepSeek V4 Flash (free) |

---

## 📋 Requisitos

- **Node.js** 18+
- **PostgreSQL** 14+
- **API Key de OpenRouter** (gratis, créala en [openrouter.ai/keys](https://openrouter.ai/keys))

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/WhatToEat.git
cd WhatToEat
```

### 2. Base de datos

Asegúrate de tener PostgreSQL corriendo y crea la base de datos:

```bash
createdb whattoeat
```

### 3. Configurar variables de entorno

```bash
cp server/.env.example server/.env
```

Edita `server/.env`:

```
PORT=3001
DATABASE_URL=postgresql://usuario:password@localhost:5432/whattoeat
OPENROUTER_API_KEY=sk-or-v1-tu-key-aqui
OPENROUTER_MODEL=deepseek/deepseek-v4-flash:free
CLIENT_URL=http://localhost:5173
```

### 4. Verificar la API key

```bash
curl -H "Authorization: Bearer TU_API_KEY" https://openrouter.ai/api/v1/auth/key
```

### 5. Instalar dependencias

```bash
# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

### 6. Migrar base de datos

```bash
cd ../server
npm run migrate
```

### 7. Iniciar en desarrollo

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Abrir en el navegador: `http://localhost:5173`

---

## 🐳 Docker (opcional)

```bash
docker-compose up -d
```

Esto levantará PostgreSQL. La app se ejecuta igual con `npm run dev`.

---

## 📖 Uso

### Primera vez — Configura tu perfil

1. Al abrir la app verás la **pantalla de configuración**
2. Completa: edad, género, nivel de actividad, objetivo, déficit calórico
3. Elige distribución de comidas (3/4/5) e intensidades
4. Selecciona cocinas o usa **"Sugerir con IA"**
5. Ajusta el límite calórico — todo se guarda automáticamente

### Generar un menú

1. Ve a la sección **Menús** y haz clic en **"Nuevo Menú"**
2. Los datos de tu perfil aparecen precargados
3. Ajusta cocinas, dificultad y agrega ingredientes de tu despensa
4. Haz clic en **"Generar con IA"**
5. Espera mientras la IA crea tu menú semanal (~10-20 segundos)

### Interactuar con el menú

- **Ver receta:** Expande cualquier comida para ver ingredientes y pasos
- **Puntuar:** Haz clic en las estrellas (⭐) para calificar platillos
- **Reemplazar:** Usa el botón 🔄 para cambiar un platillo que no te guste
- **Editar:** Modifica manualmente ingredientes o porciones

### Explorar nuevos platillos

1. Ve a la sección **Explorar**
2. La IA genera platillos según tu perfil — haz scroll infinito
3. **➕** para agregar a un menú existente
4. **❤** para guardar como favorito

### Favoritos

- Todos tus platillos guardados están en **Favoritos**
- Puedes ver recetas completas y eliminar los que ya no quieras

---

## 📁 Estructura del Proyecto

```
WhatToEat/
├── client/              # React + Vite (frontend)
│   ├── src/
│   │   ├── api/         # Llamadas HTTP al backend
│   │   ├── components/  # Componentes UI (layout, config, menus, explore, favorites)
│   │   ├── hooks/       # Custom hooks (React Query)
│   │   ├── pages/       # Páginas (rutas)
│   │   └── types/       # TypeScript types
│   └── ...
├── server/              # Express.js (backend)
│   ├── src/
│   │   ├── routes/      # Rutas express
│   │   ├── services/    # Lógica de negocio + comunicación con Ollama
│   │   ├── db/          # Pool de conexión, migraciones, queries
│   │   └── validators/  # Zod schemas
│   └── ...
├── PLAN.md              # Documentación técnica completa
└── README.md
```

---

## 🧠 Cómo funciona la IA

### Conexión con OpenRouter

El backend se comunica con OpenRouter a través de su API REST en `https://openrouter.ai/api/v1/chat/completions`. Todas las llamadas pasan por un `OpenRouterService` que construye prompts estructurados, llama al modelo DeepSeek V4 Flash y parsea la respuesta JSON.

**Arquitectura:**

```
React → POST /api/menus/generate → Express → openRouterService.ts → fetch("openrouter.ai/...") → OpenRouter
```

### Prompt personalizado

Cada prompt incluye:
- Datos completos del perfil del usuario
- Preferencias de cocina y dificultad
- Límite calórico y balance de macros
- Ingredientes disponibles en despensa
- Historial de platillos con alta puntuación (≥1 mes) para re-sugerencia
- Instrucciones estrictas de formato JSON

### Re-sugerencia mensual

Los platillos que calificas con ⭐4+ se registran en la base de datos. Al generar un nuevo menú, la IA recibe una lista de platillos que disfrutaste hace más de un mes, permitiendo que vuelvan a sugerirse de forma natural.

---

## 🎨 Animación

El **cinnamon roll** en el footer usa Framer Motion:
- **En reposo:** Se desplaza horizontalmente en loop infinito
- **Al hacer hover:** Rebota con una escala simulando un "mordisco"
- Diseñado para ser sutil y divertido sin distraer del contenido

---

## ⚙️ Configuración Avanzada

### Variables de Entorno

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto del backend |
| `DATABASE_URL` | — | URL de conexión PostgreSQL |
| `OPENROUTER_API_KEY` | — | API key de OpenRouter |
| `OPENROUTER_MODEL` | `deepseek/deepseek-v4-flash:free` | Modelo de IA a utilizar |
| `CLIENT_URL` | `http://localhost:5173` | URL del frontend (CORS) |

### Modelos Alternativos

El proyecto funciona con cualquier modelo disponible en OpenRouter. Recomendados gratuitos:

| Modelo | ID | Contexto |
|---|---|---|
| DeepSeek V4 Flash (free) 🏆 | `deepseek/deepseek-v4-flash:free` | 1.05M |
| Google Gemini 2.0 Flash (free) | `google/gemini-2.0-flash-exp:free` | 1M |
| Meta Llama 3.3 70B (free) | `meta-llama/llama-3.3-70b-instruct:free` | 128K |
| Mistral Small 24B (free) | `mistralai/mistral-small-24b-instruct-2501:free` | 32K |

Para cambiar de modelo, edita `OPENROUTER_MODEL` en `server/.env`.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Apache License 2.0 — Ver [LICENSE](LICENSE) para más detalles.
