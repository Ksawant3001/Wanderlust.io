const API_BASE = "http://localhost:5000/api";

async function fetchPlaces(lat, lng, category, limit = 20) {
  const url = `${API_BASE}/places?lat=${lat}&lng=${lng}&category=${category}&limit=${limit}`;
  const res = await fetch(url);
  return await res.json();
}
