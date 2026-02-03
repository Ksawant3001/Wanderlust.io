import express from "express";
import { searchCities } from "../services/nominatim.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const q = req.query.q;

  if (!q || q.length < 2) {
    return res.json([]);
  }

  try {
    const cities = await searchCities(q);
    res.json(cities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

export default router;
