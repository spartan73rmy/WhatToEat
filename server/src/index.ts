import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initDb } from "./db/pool";
import configRoutes from "./routes/configRoutes";
import menuRoutes from "./routes/menuRoutes";
import exploreRoutes from "./routes/exploreRoutes";
import favoritesRoutes from "./routes/favoritesRoutes";
import aiRoutes from "./routes/aiRoutes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/config", configRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "JSON inválido" });
  } else if (err instanceof Error && "issues" in err) {
    res.status(400).json({ error: "Datos inválidos", details: (err as any).issues });
  } else if (err instanceof Error && err.message?.includes("Ollama")) {
    res.status(503).json({ error: err.message });
  } else if (err instanceof Error && (err.message?.includes("relation") || err.message?.includes("does not exist"))) {
    res.status(500).json({ error: "Error de base de datos. ¿Ejecutaste 'npm run migrate'?" });
  } else if (err instanceof Error) {
    res.status(500).json({ error: err.message || "Error interno del servidor" });
  } else {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
