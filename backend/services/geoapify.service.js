import fetch from "node-fetch";

const BASE_URL = "https://api.geoapify.com/v2/places";

export async function fetchPlaces({ lat, lng, category, radius }) {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  const buildUrl = (useFilter) =>
    `${BASE_URL}?categories=${category}` +
    (useFilter ? `&filter=circle:${lng},${lat},${radius}` : "") +
    `&bias=proximity:${lng},${lat}` +
    `&limit=30` +
    `&apiKey=${apiKey}`;

  try {
    // ⏱ timeout protection
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);

    const res = await fetch(buildUrl(true), { signal: controller.signal });
    const data = await res.json();

    if (Array.isArray(data.features) && data.features.length) {
      return mapPlaces(data.features);
    }

    // fallback
    const fallback = await fetch(buildUrl(false));
    const fallbackData = await fallback.json();

    if (!Array.isArray(fallbackData.features)) return [];
    return mapPlaces(fallbackData.features);

  } catch (err) {
    console.error("❌ GEOAPIFY ERROR:", err.message);
    return [];
  }
}

function mapPlaces(features) {
  return features.map(f => {
    const p = f.properties || {};
    const raw = p.datasource?.raw || {};
    const intl = p.name_international || {};
    const other = p.name_other || {};

    // ✅ STRONG NAME RESOLUTION
    const name =
      p.name ||
      intl.en ||
      other.alt_name ||
      raw.name ||
      raw["name:en"] ||
      p.address_line1 ||
      p.formatted ||
      "Unknown place";

    // ✅ STRONG ADDRESS RESOLUTION
    const address =
      p.address_line2 ||
      p.formatted ||
      [
        p.city,
        p.state_district,
        p.state,
        p.country
      ].filter(Boolean).join(", ");

    return {
      id: p.place_id,
      name,
      address,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      categories: p.categories || []
    };
  });
}

