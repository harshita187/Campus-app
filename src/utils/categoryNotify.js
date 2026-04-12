const STORAGE_KEY = "campus_category_notify_v1";

const readSet = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
};

const writeSet = (set) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
};

export const isCategoryNotifyOn = (categoryName) =>
  readSet().has(String(categoryName));

export const toggleCategoryNotify = (categoryName) => {
  const set = readSet();
  const key = String(categoryName);
  if (set.has(key)) {
    set.delete(key);
    writeSet(set);
    return false;
  }
  set.add(key);
  writeSet(set);
  return true;
};
