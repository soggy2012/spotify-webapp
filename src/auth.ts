//Stores Spotify auth configoration and builds login URL
//Client ID from Spotify Developer Dashboard (.env file)

//Redirect URI where Spotify will send the user after authorization
const redirectURI:string = "https://spotify-webapp-eight.vercel.app/callback";

// Parse the authorization code from the URL
export function getAuthCode(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

// Initiate OAuth flow by redirecting user to Spotify authorization page
export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

   // Build query parameters for Spotify OAuth
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", redirectURI);
  params.append("scope", "playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative user-read-private user-read-email user-top-read user-library-read user-read-playback-state user-read-recently-played");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  // Redirect user to Spotify authorization page
  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
export async function getAccessToken(clientId: string, code: string): Promise<string> {
  const verifier = localStorage.getItem("verifier");
  if (!verifier) throw new Error("No code verifier found.");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectURI);
  params.append("code_verifier", verifier);


  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
  const error = await response.json();
  console.error("Spotify token request failed:", error); 
  throw new Error("Failed to get access token");
}   

  const data = await response.json();
  if (!response.ok) {
  console.error("Spotify token request failed:", data);
  throw new Error("Failed to get access token");
}

return data.access_token;
}

// Utility function: Generate a random string for PKCE code verifier
function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Utility function: Generate SHA-256 based code challenge from verifier (PKCE)
async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}