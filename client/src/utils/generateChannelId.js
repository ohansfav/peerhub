/**
 * Generate a stable Stream Chat channel ID for 1-on-1 DMs.
 * - Works with Postgres UUIDs
 * - Always returns <= 64 chars
 * - Same two users => same channel
 */
async function generateDmChannelId(userId1, userId2) {
  const combined = [userId1, userId2].sort().join("-");

  // Encode string to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);

  // Hash with SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert ArrayBuffer → hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Truncate to 64 chars (Stream’s limit)
  return hex.slice(0, 64);
}

export default generateDmChannelId;
