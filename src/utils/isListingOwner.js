/**
 * Whether the signed-in user owns this listing (Mongo seller id or same email).
 */
export function isListingOwner(product, user) {
  if (!product || !user) return false;
  const viewerIdStr = String(user._id ?? user.id ?? "").trim();
  const sid = product.sellerId;
  let sellerIdStr = "";
  if (sid != null && sid !== "") {
    sellerIdStr =
      typeof sid === "object" && sid._id != null ? String(sid._id) : String(sid);
  }
  const sellerEmail =
    typeof sid === "object" && sid != null && typeof sid.email === "string"
      ? sid.email
      : null;
  const userEmailLc = user.email ? String(user.email).toLowerCase().trim() : "";
  const sameSellerEmail = Boolean(
    sellerEmail &&
      userEmailLc &&
      String(sellerEmail).toLowerCase().trim() === userEmailLc
  );
  return Boolean(
    (viewerIdStr && sellerIdStr && viewerIdStr === sellerIdStr) || sameSellerEmail
  );
}
