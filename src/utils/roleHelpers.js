/** @param {string | undefined} role */
export function canSell(role) {
  if (!role) return true;
  return role === "seller" || role === "both";
}

/** @param {string | undefined} role */
export function isBuyerOnly(role) {
  return role === "buyer";
}

/** @param {string | undefined} role */
export function canBuy(role) {
  if (!role) return true;
  return role === "buyer" || role === "both";
}
