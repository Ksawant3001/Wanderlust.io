export function selectPlaces({ attractions, food, stay, days }) {
  // sort by distance (closer = better)
  const sortByDistance = arr =>
    [...arr].sort((a, b) => a.distance - b.distance);

  const selectedAttractions = sortByDistance(attractions)
    .slice(0, days * 2);

  const selectedFood = sortByDistance(food)
    .slice(0, days * 2);

  const selectedStay = sortByDistance(stay)
    .slice(0, 1);

  return {
    attractions: selectedAttractions,
    food: selectedFood,
    stay: selectedStay
  };
}
