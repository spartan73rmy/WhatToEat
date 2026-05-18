import { Router } from "express";
import { ollamaService } from "../services/ollamaService";
import { suggestCuisines } from "../services/menuService";

const router = Router();

router.post("/suggest-cuisines", async (_req, res, next) => {
  try {
    const cuisines = await suggestCuisines();
    res.json(cuisines);
  } catch (err) {
    next(err);
  }
});

router.post("/warmup", async (_req, res, next) => {
  try {
    await ollamaService.warmup();
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

export default router;
