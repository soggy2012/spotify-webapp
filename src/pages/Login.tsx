import React from "react";
import { redirectToAuthCodeFlow } from "../auth"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';

const clientID: string = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;

const Login: React.FC = () => {
  const handleLogin = async () => {
      await redirectToAuthCodeFlow(clientID);
  };


  return (
    <>
    <div className="relative h-screen overflow-hidden">
      <video autoPlay muted loop playsInline className="absolute top-0 left-0 w-full h-screen object-cover z-0" >
        <source src="/loginvid.mp4" type="video/mp4"/>
      </video>
      <div className="absolute inset-0 bg-black/85 z-10" />

      <div className="relative flex flex-col items-center justify-center h-screen z-10">
        <h1 className="text-5xl text-white mb-4 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">BLUE</h1>
        <p className="text-gray-300 mb-8 text-lg text-center">The right moment and time, with the right sound.</p>
        <button
          onClick={handleLogin}
          
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Login with Spotify

          <FontAwesomeIcon icon={faSpotify} className="ml-2 " />
        </button>
        <p className="text-[11px] text-gray-400 text-center mx-4 mt-8">
          *You will be securely redirected to Spotify. Your login information is not seen or stored.
        </p>
      </div>
    </div>
    </>
  );
};

export default Login;