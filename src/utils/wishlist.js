const STORAGE_KEY = "campus_wishlist_v1";

const readIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const writeIds = (ids) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
};

export const getWishlistIds = () => readIds();

export const isWishlisted = (productId) => {
  if (!productId) return false;
  return readIds().includes(String(productId));
};

export const toggleWishlist = (productId) => {
  if (!productId) return false;
  const id = String(productId);
  const ids = readIds();
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
    writeIds(ids);
    return false;
  }
  ids.push(id);
  writeIds(ids);
  return true;
};
