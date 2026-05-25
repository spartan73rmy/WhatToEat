import { Router } from "express";
import { listFavorites, addFavorite, removeFavorite } from "../db/queries";
import { favoriteSchema } from "../validators/schemas";

const router = Router();

router.get("/", async (_req, res) => {
  const favorites = await listFavorites();
  res.json(favorites);
});

router.post("/", async (req, res) => {
  const data = favoriteSchema.parse(req.body);
  const fav = await addFavorite(data);
  res.status(201).json(fav);
});

router.delete("/:id", async (req, res) => {
  await removeFavorite(Number(req.params.id));
  res.status(204).end();
});

export default router;
