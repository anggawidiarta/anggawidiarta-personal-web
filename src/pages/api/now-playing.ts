import type { APIRoute } from "astro";
import { getNowPlaying } from "../../lib/spotify";

export const prerender = false;

// Vercel's CDN absorbs visitor polling, so Spotify sees a request every few seconds at most.
const cacheControl = "public, s-maxage=15, stale-while-revalidate=45";

export const GET: APIRoute = async () => {
  const track = await getNowPlaying();
  if (!track) return new Response(null, { status: 204, headers: { "Cache-Control": cacheControl } });

  return new Response(JSON.stringify(track), {
    headers: { "Content-Type": "application/json", "Cache-Control": cacheControl },
  });
};
