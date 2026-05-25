import { Router } from "express";
import { getConfig } from "../db/queries";
import { ai } from "../services/openRouterService";

const router = Router();

router.post("/suggest-cuisines", async (_req, res) => {
  const config = await getConfig();
  if (!config) {
    res.status(400).json({ error: "Configura tu perfil primero" });
    return;
  }

  const systemPrompt = [
    "Recomienda tipos de cocina ideales para este perfil:",
    `- ${config.gender === "mujer" ? "Mujer" : "Hombre"}, ${config.age} años, ${config.activity}`,
    `- Objetivo: ${config.goal} con déficit calórico`,
    "- Cocina rápida (<30 min preparación)",
    "- Ingredientes accesibles, platillos bajos en calorías",
    "- Sabores que satisfacen sin exceder calorías",
    "",
    "Responde ÚNICAMENTE un JSON array de strings con 3 a 5 cocinas.",
  ].join("\n");

  const raw = await ai.chat("¿Qué cocinas me recomiendas?", systemPrompt);
  const cleaned = raw.replace(/```(json)?/g, "").trim();

  let cuisines: string[];
  try {
    cuisines = JSON.parse(cleaned);
  } catch {
    cuisines = ["mexicana", "japonesa", "mediterránea", "coreana", "vegetariana"];
  }

  res.json({ cuisines });
});

export default router;
