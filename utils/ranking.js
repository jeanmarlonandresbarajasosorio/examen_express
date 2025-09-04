/**
 * Calcula el ranking promedio de una película
 * @param {Array} reviews - Lista de reviews con ratings
 * @returns {Number} promedio del rating
 */
export const calculateRanking = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;

  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((total / reviews.length).toFixed(1));
};