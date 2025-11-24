import type { Route } from "./+types/api.audio.$filename";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { filename } = params;

  // Access R2 bucket from context
  const bucket = context.cloudflare.env.R2;

  // Get the audio file from R2
  const object = await bucket.get(`audio/${filename}`);

  if (!object) {
    return new Response("Audio file not found", { status: 404 });
  }

  // Return the audio file with proper headers
  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": object.size.toString(),
    },
  });
}
