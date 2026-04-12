/** Heuristic: college / institution email domains for a "Verified student" badge. */
export function isCampusEmail(email) {
  if (!email || typeof email !== "string") return false;
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  if (domain.endsWith(".edu")) return true;
  if (domain.endsWith(".ac.in") || domain.endsWith(".ac.uk")) return true;
  if (domain.includes(".edu.")) return true;
  return false;
}
