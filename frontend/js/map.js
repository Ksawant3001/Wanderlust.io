// frontend/js/map.js

let map;

/**
 * Initialize Leaflet map
 * @param {number} lat
 * @param {number} lng
 */
function initMap(lat, lng) {
  // If map already exists, just move it
  if (map) {
    map.setView([lat, lng], 13);
    return map;
  }

  // Create map
  map = L.map("map").setView([lat, lng], 13);

  // Base layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  // 🔗 STEP 9.6 — CONNECT ITINERARY ↔ MAP
  if (typeof enableItineraryMapSync === "function") {
    enableItineraryMapSync(map);
  }

  return map;
}

/**
 * Add marker to map
 */
function addMapMarker(lat, lng, name = "") {
  if (!map) return;

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<strong>${name}</strong>`);
}
