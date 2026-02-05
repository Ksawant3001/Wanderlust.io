const generateBtn = document.getElementById("generateBtn");

function getTripConfig() {
  return {
    city: getSelectedCity(),
    days: Number(document.getElementById("totalDays").value),
    people: Number(document.getElementById("totalPeople").value),
    budget: Number(document.getElementById("totalBudget").value)
  };
}

function validateTripConfig(config) {
  if (!config.city) return "Please select a city from suggestions";
  if (!config.days || config.days < 1) return "Enter valid number of days";
  if (!config.people || config.people < 1) return "Enter valid people count";
  if (!config.budget || config.budget < 1) return "Enter valid budget";
  return null;
}

generateBtn.addEventListener("click", () => {
  const config = getTripConfig();
  const error = validateTripConfig(config);

  if (error) {
    alert(error);
    return;
  }

  generateTrip(config);
});

async function generateTrip(config) {
  try {
    const attractions = await fetchPlaces(config.city, "attractions");
    const food = await fetchPlaces(config.city, "food");
    const stays = await fetchPlaces(config.city, "stay");

    const tripPlan = buildTripPlan(config, {
      attractions,
      food,
      stays
    });

    renderItinerary(tripPlan, config.city);
    generateBtn.textContent = "View Trip";
  } catch (err) {
    console.error("❌ Trip failed", err);
  }
}

function fetchPlaces(city, type) {
  return fetch(
    `http://localhost:5000/api/places?lat=${city.lat}&lng=${city.lon}&type=${type}`
  ).then(res => res.json());
}

// ---------------- DISTANCE + TRANSPORT ----------------

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTransportByDistance(distanceKm) {
  if (distanceKm <= 3) return { mode: "Auto / Taxi", rate: 25 };
  if (distanceKm <= 15) return { mode: "Bus", rate: 5 };
  return { mode: "Train", rate: 2 };
}

function calculateTransport(from, to) {
  const distance = calculateDistance(
    from.lat,
    from.lng,
    to.lat,
    to.lng
  );
  const transport = getTransportByDistance(distance);
  return {
    distance: Number(distance.toFixed(1)),
    mode: transport.mode,
    fare: Math.round(distance * transport.rate)
  };
}
// ---------------- TRIP STYLE ----------------

function getTripStyle(budgetPerDay, days) {
  if (days >= 6) return "balanced";
  if (budgetPerDay < 1500) return "tight";
  if (budgetPerDay < 3500) return "balanced";
  return "relaxed";
}
// ---------------- BUILD TRIP ----------------

function buildTripPlan(config, places) {
  const plan = [];

  const budgetPerDay = config.budget / config.days;
  const tripStyle = getTripStyle(budgetPerDay, config.days);
  const attractionsPerDay = tripStyle === "relaxed" ? 3 : 2;

  const beaches = [];
  const others = [];

  places.attractions.forEach(p => {
    const isBeach = (p.categories || []).some(c => c.includes("beach"));
    if (isBeach) beaches.push(p);
    else others.push(p);
  });

  const sortByDistance = list =>
    list
      .map(p => ({
        ...p,
        distance: calculateDistance(
          config.city.lat,
          config.city.lon,
          p.lat,
          p.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance);

  let sortedBeaches = sortByDistance(beaches);
  let sortedOthers = sortByDistance(others);

  let foodIndex = 0;
  const stay = places.stays[0] || null;

  for (let day = 1; day <= config.days; day++) {
    let dayAttractions = [];

    if (day <= 2 && sortedBeaches.length) {
      dayAttractions.push(sortedBeaches.shift());
      dayAttractions.push(
        ...sortedOthers.splice(0, attractionsPerDay - 1)
      );
    } else {
      dayAttractions = sortedOthers.splice(0, attractionsPerDay);

      if (dayAttractions.length < attractionsPerDay && sortedBeaches.length) {
        dayAttractions.push(
          ...sortedBeaches.splice(
            0,
            attractionsPerDay - dayAttractions.length
          )
        );
      }
    }

    // 🔹 Attach transport between attractions
    dayAttractions = dayAttractions.map((place, index) => {
      if (index === 0) return place;
      return {
        ...place,
        transport: calculateTransport(
          dayAttractions[index - 1],
          place
        )
      };
    });

    const dayFood = places.food.slice(foodIndex, foodIndex + 2);
    foodIndex += 2;

    plan.push({
      day,
      tripStyle,
      attractions: dayAttractions,
      food: dayFood,
      stay
    });
  }

  return plan;
}

// ---------------- PDF ----------------

document.getElementById("downloadPdfBtn").addEventListener("click", () => {
  if (!window.currentTripPlan || !window.currentTripPlan.length) {
    alert("Generate a trip first");
    return;
  }

  const pdfContainer = document.createElement("div");
  pdfContainer.style.padding = "20px";
  pdfContainer.style.fontFamily = "Arial, sans-serif";
  pdfContainer.style.fontSize = "12px";

  pdfContainer.innerHTML = buildPdfHtml(window.currentTripPlan);
  document.body.appendChild(pdfContainer);

  html2pdf()
    .from(pdfContainer)
    .set({
      margin: 15,
      filename: "trip-itinerary.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4" }
    })
    .save()
    .then(() => document.body.removeChild(pdfContainer));
});

function buildPdfHtml(tripPlan) {
  return tripPlan
    .map(day => `
      <div style="margin-bottom: 20px;">
        <h2>Day ${day.day}</h2>
        ${renderPdfSection("Attractions", day.attractions)}
        ${renderPdfSection("Food", day.food)}
        ${renderPdfStay(day.stay)}
        <hr />
      </div>
    `)
    .join("");
}

function renderPdfSection(title, items = []) {
  if (!items.length) return "";
  return `
    <div>
      <strong>${title}:</strong>
      <ul>
        ${items.map(i => `
          <li>
            ${i.name}
            ${i.transport
              ? ` — ${i.transport.mode} (${i.transport.distance} km, ₹${i.transport.fare})`
              : ""
            }
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function renderPdfStay(stay) {
  if (!stay) return "";
  return `
    <div>
      <strong>Stay:</strong>
      <p>${stay.name}</p>
    </div>
  `;
}

generateBtn.addEventListener("click", () => {
  const itineraryEl = document.getElementById("itinerary");
  if (
    window.currentTripPlan &&
    window.currentTripPlan.length &&
    itineraryEl &&
    itineraryEl.innerHTML.trim() !== ""
  ) {
    itineraryEl.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    return;
  }

  const config = getTripConfig();
  const error = validateTripConfig(config);

  if (error) {
    alert(error);
    return;
  }
  generateTrip(config);
});
