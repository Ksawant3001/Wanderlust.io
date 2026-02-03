export function distributeIntoDays({ attractions, food, stay, days }) {
  const result = [];

  for (let i = 0; i < days; i++) {
    result.push({
      day: i + 1,
      attractions: [],
      food: [],
      stay: stay[0] || null
    });
  }

  attractions.forEach((place, index) => {
    const dayIndex = index % days;
    result[dayIndex].attractions.push(place);
  });

  food.forEach((place, index) => {
    const dayIndex = index % days;
    result[dayIndex].food.push(place);
  });

  return result;
}
