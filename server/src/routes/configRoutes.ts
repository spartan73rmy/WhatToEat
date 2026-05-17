import { Router } from "express";
import { getConfig, updateConfig } from "../db/queries";
import { updateConfigSchema } from "../validators/schemas";

const router = Router();

router.get("/", async (_req, res) => {
  const config = await getConfig();
  res.json(config);
});

router.put("/", async (req, res) => {
  const parsed = updateConfigSchema.parse(req.body);
  const updated = await updateConfig(parsed as Record<string, unknown>);
  res.json(updated);
});

export default router;
