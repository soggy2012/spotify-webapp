import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../auth";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const runAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        console.error("No code found");
        return;
      }

      try {
        const token = await getAccessToken(clientId, code);
        localStorage.setItem("access_token", token);
        navigate("/dashboard");
      } catch (err) {
        console.error("Token exchange failed:", err);
      }
    };

    runAuth();
  }, [navigate]);

  return <div className="text-white">Authorizing with Spotify...</div>;
};

export default Callback;