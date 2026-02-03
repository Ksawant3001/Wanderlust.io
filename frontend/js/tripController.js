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

  } catch (err) {
    console.error("❌ Trip failed", err);
  }
}

function fetchPlaces(city, type) {
  return fetch(
    `http://127.0.0.1:5000/api/places?lat=${city.lat}&lng=${city.lon}&type=${type}`
  ).then(res => res.json());
}


function fetchPlaces(city, type) {
  return fetch(
    `http://localhost:5000/api/places?lat=${city.lat}&lng=${city.lon}&type=${type}`
  ).then(res => res.json());
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


function getTripStyle(budgetPerDay, days) {
  // Long trips should not feel empty
  if (days >= 6) return "balanced";

  if (budgetPerDay < 1500) return "tight";
  if (budgetPerDay < 3500) return "balanced";
  return "relaxed";
}

// function buildTripPlan(config, places) {
//   const plan = [];

//   const budgetPerDay = config.budget / config.days;
//   const tripStyle = getTripStyle(budgetPerDay, config.days);

//   // 2/day minimum, 3/day for relaxed trips
//   const MAX_ATTRACTIONS_PER_DAY =
//     tripStyle === "relaxed" ? 3 : 2;

//   // Sort attractions by distance
//   const sortedAttractions = places.attractions
//     .map(p => ({
//       ...p,
//       distance: calculateDistance(
//         config.city.lat,
//         config.city.lon,
//         p.lat,
//         p.lng
//       )
//     }))
//     .sort((a, b) => a.distance - b.distance);

//   // Decide total attractions globally
//   const totalAttractionsToVisit = Math.min(
//     sortedAttractions.length,
//     config.days * MAX_ATTRACTIONS_PER_DAY
//   );

//   const selectedAttractions = sortedAttractions.slice(
//     0,
//     totalAttractionsToVisit
//   );

//   // Mark TOP PICKS (first 40%)
//   const topPickCount = Math.ceil(selectedAttractions.length * 0.4);

//   const enrichedAttractions = selectedAttractions.map((a, index) => ({
//     ...a,
//     isTopPick: index < topPickCount,
//     rating: a.rating ?? null
//   }));

//   // Distribute evenly across days
//   const attractionsPerDay = Math.ceil(
//     enrichedAttractions.length / config.days
//   );

//   let attractionIndex = 0;
//   let foodIndex = 0;
//   const stay = places.stays[0] || null;

//   for (let day = 1; day <= config.days; day++) {
//     const dayAttractions = enrichedAttractions.slice(
//       attractionIndex,
//       attractionIndex + attractionsPerDay
//     );
//     attractionIndex += attractionsPerDay;

//     const dayFood = places.food.slice(foodIndex, foodIndex + 2);
//     foodIndex += 2;

//     plan.push({
//       day,
//       tripStyle,
//       attractions: dayAttractions,
//       food: dayFood,
//       stay
//     });
//   }

//   return plan;
// }

function buildTripPlan(config, places) {
  const plan = [];

  const budgetPerDay = config.budget / config.days;
  const tripStyle = getTripStyle(budgetPerDay, config.days);

  const attractionsPerDay =
    tripStyle === "relaxed" ? 3 : 2;

  const beaches = [];
  const others = [];

  places.attractions.forEach(p => {
    const isBeach = (p.categories || []).some(c =>
      c.includes("beach")
    );
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

    // 🟢 Day 1 & 2 → Beach + light attractions
    if (day <= 2 && sortedBeaches.length) {
      // 🌊 One beach
      dayAttractions.push(sortedBeaches.shift());

      // 🏛 Nearby small attractions
      const remainingSlots = attractionsPerDay - 1;
      dayAttractions.push(
        ...sortedOthers.splice(0, remainingSlots)
      );
    } 
    // 🔵 Normal days
    else {
      dayAttractions = sortedOthers.splice(0, attractionsPerDay);

      // fallback: use beaches if others are exhausted
      if (
        dayAttractions.length < attractionsPerDay &&
        sortedBeaches.length
      ) {
        dayAttractions.push(
          ...sortedBeaches.splice(
            0,
            attractionsPerDay - dayAttractions.length
          )
        );
      }
    }

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
