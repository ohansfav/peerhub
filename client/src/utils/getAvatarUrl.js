/**
 * Returns the profile image URL or a fallback avatar with initials.
 */
export function getAvatarUrl(imageUrl, name = "User") {
  if (imageUrl) return imageUrl;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&size=128&bold=true&format=svg`;
}
