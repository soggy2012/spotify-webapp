//Stores Spotify auth configoration and builds login URL

//Client ID from Spotify Developer Dashboard (.env file)

// :string is used to ensure the type is a string
const clientID:string = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;

//Redirect URI where Spotify will send the user after authorization
const redirectURI:string = "http://127.0.0.1:5173/callback";

// Parse the authorization code from the URL
export function getAuthCode(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

// Step 1: Redirect to Spotify for login
export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", redirectURI);
  params.append("scope", "user-read-private user-read-email user-top-read user-library-read user-read-playback-state user-read-recently-played");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Step 2: Exchange the code for an access token
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

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}