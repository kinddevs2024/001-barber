// Image pool for the barbershop website
export const imagePool = [
  "/5273736187975765549_121.jpg",
  "/5273736187975765548_121.jpg",
  "/5273736187975765550_121.jpg",
  "/Screenshot 2025-11-26 175000.png",
  "/Screenshot 2025-11-26 175006.png",
  "/Screenshot 2025-11-26 175015.png",
  "/Screenshot 2025-11-26 175026.png",
];

// Get random images from the pool
export const getRandomImages = (count) => {
  const shuffled = [...imagePool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get images in order (cycling through the pool)
export const getImagesInOrder = (count) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(imagePool[i % imagePool.length]);
  }
  return result;
};
