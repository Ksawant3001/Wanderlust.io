import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  const { text } = req.query;

  if (!text) {
    return res.json([]);
  }

  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    text
  )}&filter=countrycode:in&apiKey=${process.env.GEOAPIFY_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.features || []);
  } catch (err) {
    res.status(500).json({ error: "Geocoding failed" });
  }
});

export default router;
