export function normalizeSlug(input: string) {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return slug;
}

function randomChars(alphabet: string, length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function generatePublicId() {
  // Short, URL-safe, easy-to-type.
  return randomChars("abcdefghjkmnpqrstuvwxyz23456789", 10);
}

export function generateCouponCode() {
  // Short, uppercase, staff-friendly.
  return randomChars("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);
}
