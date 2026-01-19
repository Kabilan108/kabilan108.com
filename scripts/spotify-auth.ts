#!/usr/bin/env bun

/**
 * One-time Spotify OAuth Token Generator
 *
 * This script helps you obtain a refresh token for the Spotify API.
 * Run this once, then manually add the refresh token to Cloudflare Workers KV.
 *
 * Usage:
 *   1. Create a Spotify app at https://developer.spotify.com/dashboard
 *   2. Set redirect URI to: http://localhost:8888/callback
 *   3. Run: bun run scripts/spotify-auth.ts
 *   4. Follow the prompts and authorize in your browser
 *   5. Copy the refresh token to Cloudflare Workers KV
 */

// Configuration - Replace these with your Spotify app credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPES = ["user-read-currently-playing", "user-read-recently-played"];
const PORT = 8888;

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// Check if credentials are provided
if (CLIENT_ID === "YOUR_CLIENT_ID" || CLIENT_SECRET === "YOUR_CLIENT_SECRET") {
  console.error("\n❌ Error: Spotify credentials not set!\n");
  console.log("Set them as environment variables:");
  console.log('  export SPOTIFY_CLIENT_ID="your_client_id"');
  console.log('  export SPOTIFY_CLIENT_SECRET="your_client_secret"\n');
  console.log("Or edit this script directly.\n");
  process.exit(1);
}

/**
 * Exchange authorization code for access and refresh tokens
 */
async function exchangeCodeForTokens(
  code: string,
): Promise<SpotifyTokenResponse> {
  const tokenUrl = "https://accounts.spotify.com/api/token";
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Open URL in default browser
 */
async function openBrowser(url: string): Promise<void> {
  const { $ } = await import("bun");

  // Detect OS and use appropriate command
  const os = process.platform;
  if (os === "darwin") {
    await $`open ${url}`.quiet();
  } else if (os === "linux") {
    await $`xdg-open ${url}`.quiet();
  } else if (os === "win32") {
    await $`start ${url}`.quiet();
  }
}

/**
 * Start local server to handle OAuth callback
 */
async function startCallbackServer(): Promise<SpotifyTokenResponse> {
  return new Promise((resolve, reject) => {
    const server = Bun.serve({
      host: "0.0.0.0",
      port: PORT,
      async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === "/callback") {
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");

          if (error) {
            setTimeout(() => {
              server.stop();
              reject(new Error(`Authorization failed: ${error}`));
            }, 100);

            return new Response(
              "<h1>❌ Authorization failed!</h1><p>You can close this window.</p>",
              {
                headers: { "Content-Type": "text/html" },
              },
            );
          }

          if (!code) {
            setTimeout(() => {
              server.stop();
              reject(new Error("No authorization code received"));
            }, 100);

            return new Response("<h1>❌ No authorization code received</h1>", {
              status: 400,
              headers: { "Content-Type": "text/html" },
            });
          }

          try {
            // Exchange code for tokens
            console.log("\n⏳ Exchanging authorization code for tokens...");
            const tokens = await exchangeCodeForTokens(code);

            // Success response
            setTimeout(() => {
              server.stop();
              resolve(tokens);
            }, 100);

            return new Response(
              `
              <html>
                <head>
                  <title>Spotify Auth Success</title>
                  <style>
                    body { font-family: monospace; padding: 40px; max-width: 800px; margin: 0 auto; }
                    h1 { color: #1DB954; }
                    code { background: #f4f4f4; padding: 20px; display: block; margin: 20px 0; border-radius: 5px; }
                  </style>
                </head>
                <body>
                  <h1>✅ Authorization Successful!</h1>
                  <p>Your tokens have been generated. Check the terminal for details.</p>
                  <p>You can close this window now.</p>
                </body>
              </html>
              `,
              {
                headers: { "Content-Type": "text/html" },
              },
            );
          } catch (err) {
            setTimeout(() => {
              server.stop();
              reject(err);
            }, 100);

            return new Response(
              `<h1>❌ Error</h1><p>${err instanceof Error ? err.message : "Unknown error"}</p>`,
              {
                status: 500,
                headers: { "Content-Type": "text/html" },
              },
            );
          }
        }

        return new Response("Not found", { status: 404 });
      },
    });

    console.log(`\n🎵 Spotify OAuth Token Generator\n`);
    console.log(`📡 Callback server listening on http://localhost:${PORT}`);
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Build authorization URL
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.append("client_id", CLIENT_ID);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("scope", SCOPES.join(" "));

    console.log("\n🔐 Opening Spotify authorization page in your browser...");
    console.log("   If it doesn't open automatically, visit:\n");
    console.log(`   ${authUrl.toString()}\n`);

    // Open browser
    await openBrowser(authUrl.toString());

    // Start callback server and wait for tokens
    const tokens = await startCallbackServer();

    // Display results
    console.log("\n✅ Success! Tokens received:\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("REFRESH TOKEN (save this in Cloudflare Workers KV):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log(tokens.refresh_token);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("ACCESS TOKEN (expires in 1 hour):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log(tokens.access_token);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📝 Next Steps:\n");
    console.log("1. In Cloudflare Workers dashboard, go to your KV namespace");
    console.log('2. Create a new key: "spotify:tokens"');
    console.log("3. Set the value to:");
    console.log("\n   {");
    console.log('     "access_token": "' + tokens.access_token + '",');
    console.log('     "refresh_token": "' + tokens.refresh_token + '",');
    console.log(
      '     "expires_at": ' + (Date.now() + tokens.expires_in * 1000),
    );
    console.log("   }\n");
    console.log("Or use the wrangler CLI:");
    console.log("\n   cd workers/spotify-now-playing");
    console.log(
      '   wrangler kv:key put --binding=SPOTIFY_KV "spotify:tokens" \\',
    );
    console.log(
      '     \'{"access_token":"' +
        tokens.access_token +
        '","refresh_token":"' +
        tokens.refresh_token +
        '","expires_at":' +
        (Date.now() + tokens.expires_in * 1000) +
        "}'\\n",
    );
  } catch (err) {
    console.error(
      "\n❌ Error:",
      err instanceof Error ? err.message : "Unknown error",
    );
    process.exit(1);
  }
}

// Run the script
main();

export { exchangeCodeForTokens };
