const KEY = "campus_recent_products_v1";
const MAX = 8;

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
};

const write = (ids) => {
  localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
};

export const recordProductView = (productId) => {
  if (!productId) return;
  const id = String(productId);
  const ids = read().filter((x) => x !== id);
  ids.unshift(id);
  write(ids);
};

export const getRecentProductIds = () => read();
