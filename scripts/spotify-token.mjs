// One-time helper: signs in to Spotify and prints the refresh token for the nav widget.
//   node --env-file=.env scripts/spotify-token.mjs
// Needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env, and this redirect URI on the app:
//   http://127.0.0.1:8888/callback
import { createServer } from "node:http";

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env first.");
  process.exit(1);
}

const redirect = "http://127.0.0.1:8888/callback";
const authorize = new URL("https://accounts.spotify.com/authorize");
authorize.search = new URLSearchParams({
  client_id: id,
  response_type: "code",
  redirect_uri: redirect,
  scope: "user-read-currently-playing user-read-recently-played",
}).toString();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:8888");
  if (url.pathname !== "/callback") return res.writeHead(404).end();

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("Spotify did not return a code.");
    console.error("Spotify error:", url.searchParams.get("error"));
    return server.close();
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirect }),
  });
  const data = await response.json();

  if (!response.ok) {
    res.writeHead(500).end("Token exchange failed. See the terminal.");
    console.error("Token exchange failed:", data);
  } else {
    res.end("Done. You can close this tab and return to the terminal.");
    console.log(`\nSPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
    console.log("Add it to .env and to the Vercel environment variables.");
  }
  server.close();
});

server.listen(8888, "127.0.0.1", () => {
  console.log("Open this URL, sign in and approve:\n");
  console.log(authorize.href, "\n");
});
