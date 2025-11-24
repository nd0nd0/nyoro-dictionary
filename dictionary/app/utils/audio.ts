/**
 * Generates the URL for an audio file stored in R2
 * @param audioPath - The path from the database (e.g., "audio/ball.mp3")
 * @returns The full URL to access the audio file via the API route
 */
export function getAudioUrl(audioPath: string | null): string | null {
  if (!audioPath) return null;

  // Extract just the filename from the path
  // audioPath is like "audio/ball.mp3", we want just "ball.mp3"
  const filename = audioPath.replace(/^audio\//, "");

  // Return the API route URL
  return `/api/audio/${filename}`;
}
