import express from "express";
import { fetchPlaces } from "../services/geoapify.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("🔥 /api/places HIT", req.query);

  const { lat, lng, type } = req.query;
  if (!lat || !lng || !type) {
    return res.status(400).json({ error: "lat, lng, type required" });
  }

  let category;

  if (type === "attractions") {
    category = [
      "tourism",
      "tourism.attraction",
      "tourism.sights",
      "tourism.sights.fort",
      "tourism.sights.castle",
      "tourism.sights.place_of_worship",
      "beach",
      "beach.beach_resort"
    ].join(",");
  } else if (type === "food") {
    category = [
      "catering.restaurant",
      "catering.cafe",
      "catering.fast_food"
    ].join(",");
  } else if (type === "stay") {
    category = [
      "accommodation.hotel",
      "accommodation.guest_house",
      "accommodation.hostel"
    ].join(",");
  } else {
    return res.status(400).json({ error: "Invalid type" });
  }

  try {
    const places = await fetchPlaces({
      lat,
      lng,
      category,
      radius: type === "attractions" ? 50000 : 6000
    });

    console.log("✅ Places found:", places.length);
    res.json(places);
  } catch (err) {
    console.error("❌ ROUTE ERROR:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

export default router;
