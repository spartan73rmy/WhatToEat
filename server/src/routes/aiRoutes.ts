import { Router } from "express";
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

export default router;
