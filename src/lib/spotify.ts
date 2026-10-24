import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
} from "astro:env/server";

export type NowPlaying = {
  state: "playing" | "paused" | "recent";
  title: string;
  artist: string;
  album: string;
  image: string | null;
  url: string;
  progressMs?: number;
  durationMs?: number;
  /** ISO time, only for state "recent". */
  playedAt?: string;
};

type SpotifyTrack = {
  type?: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { name: string; images: { url: string; width: number | null }[] };
  external_urls: { spotify: string };
};

const API = "https://api.spotify.com/v1/me/player";

// The access token lives an hour; keep it while this function instance stays warm.
let cached: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) return null;

  const { access_token, expires_in } = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  cached = { token: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return access_token;
}

/** The smallest cover that is still at least 64px, so it stays sharp at 32px on retina. */
function pickImage(images: SpotifyTrack["album"]["images"]): string | null {
  const sized = images.filter((image) => (image.width ?? 0) >= 64);
  const smallest = sized.sort((a, b) => (a.width ?? 0) - (b.width ?? 0))[0];
  return (smallest ?? images[0])?.url ?? null;
}

function normalize(
  track: SpotifyTrack,
  extra: Pick<NowPlaying, "state"> & Partial<NowPlaying>,
): NowPlaying {
  return {
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    album: track.album.name,
    image: pickImage(track.album.images),
    url: track.external_urls.spotify,
    durationMs: track.duration_ms,
    ...extra,
  };
}

async function get(path: string, token: string): Promise<Response> {
  return fetch(`${API}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(6000),
  });
}

/**
 * What Angga is listening to now, or the last track he played. `null` when Spotify is not
 * configured or unreachable: the widget is decoration, so callers just hide it.
 */
export async function getNowPlaying(): Promise<NowPlaying | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const current = await get("currently-playing", token);
    if (current.status === 200) {
      const data = (await current.json()) as {
        is_playing: boolean;
        progress_ms: number | null;
        item: SpotifyTrack | null;
      };
      // Ads and podcast episodes are not tracks: fall through to the last played song.
      if (data.item?.type === "track") {
        return normalize(data.item, {
          state: data.is_playing ? "playing" : "paused",
          progressMs: data.progress_ms ?? 0,
        });
      }
    }

    const recent = await get("recently-played?limit=1", token);
    if (!recent.ok) return null;
    const { items } = (await recent.json()) as {
      items: { track: SpotifyTrack; played_at: string }[];
    };
    const last = items[0];
    return last ? normalize(last.track, { state: "recent", playedAt: last.played_at }) : null;
  } catch {
    return null;
  }
}
