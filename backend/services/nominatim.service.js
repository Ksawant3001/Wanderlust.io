import fetch from "node-fetch";

export async function searchCities(query) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query)}` +
    `&format=json` +
    `&addressdetails=1` +
    `&limit=8` +
    `&countrycodes=in`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "TripPlan1/1.0 (India travel planner)"
    }
  });

  const data = await res.json();

  return data
    .filter(p => p.address?.country_code === "in")
    .map(p => {
  const addr = p.address || {};

  const name =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.county ||
    addr.state_district ||
    addr.state ||
    "Unknown";

  const state =
    addr.state ||
    addr.region ||
    addr.county ||
    "India";

  return {
    name,
    state,
    lat: Number(p.lat),
    lng: Number(p.lon)
  };
});

}
