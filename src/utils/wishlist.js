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

const notifyWishlistChanged = () => {
  try {
    window.dispatchEvent(new Event("campus:wishlist-changed"));
  } catch {
    /* ignore */
  }
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
    notifyWishlistChanged();
    return false;
  }
  ids.push(id);
  writeIds(ids);
  notifyWishlistChanged();
  return true;
};

/** Remove one id (e.g. listing deleted or no longer available). */
export const removeFromWishlist = (productId) => {
  if (!productId) return;
  const id = String(productId);
  const ids = readIds().filter((x) => x !== id);
  writeIds(ids);
  notifyWishlistChanged();
};
