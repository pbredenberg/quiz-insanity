import md5 from 'md5';

/**
 * Generate a Gravatar URL for the given email address
 * @param email The email address to generate a Gravatar for
 * @param size The size of the Gravatar in pixels (default: 80)
 * @returns The URL to the Gravatar image
 */
export function getGravatarUrl(email: string, size = 80): string {
  // If no email is provided, return a default avatar
  if (!email) {
    return `https://www.gravatar.com/avatar/00000000000000000000000000000000?s=${size}&d=mp`;
  }
  
  // Create an MD5 hash of the trimmed, lowercase email
  const hash = md5(email.trim().toLowerCase());
  
  // Return the Gravatar URL with the specified size and default style
  // 'd=mp' provides a "mystery person" silhouette if no Gravatar exists
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
}
