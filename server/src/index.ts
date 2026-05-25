import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import configRoutes from "./routes/configRoutes";
import menuRoutes from "./routes/menuRoutes";
import exploreRoutes from "./routes/exploreRoutes";
import favoritesRoutes from "./routes/favoritesRoutes";
import aiRoutes from "./routes/aiRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/config", configRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  if (err.name === "ZodError") {
    res.status(400).json({ error: "Validation error", details: err.errors });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
