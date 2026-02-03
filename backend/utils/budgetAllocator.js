export function allocateBudget({ days, people, totalBudget }) {
  return {
    stay: totalBudget * 0.4,
    food: totalBudget * 0.28,
    sightseeing: totalBudget * 0.17,
    transport: totalBudget * 0.15
  };
}
