import { use, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './index.css'


type Artist = {
  name: string;
};

type AlbumImage = {
  url: string;
};

type Album = {
  images: AlbumImage[];
};

type Track = {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
};


const App = () => {
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState<string>("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  

  const token = localStorage.getItem("access_token");

  //Fetch user data from Spotify API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;

      try {
        const res = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    fetchUserData();
   }, [token]);

   // Search tracks based on input
   useEffect(() => {
      if(!input || !token) {
        setTracks([]);
        return;
      }

      const delayDebounce = setTimeout(async () => {
        try {
          const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(input)}&type=track&limit=10`, 
          {
            headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch tracks");

      const data = await res.json();
      setTracks(data.tracks.items);
      setShowDropdown(true);
      } catch (error) {
        console.error("Failed to search tracks:", error);
      }
      }, 300);
      return () => clearTimeout(delayDebounce);

  }, [input, token]);

  return (
    <>
      <div className="bg-gray-800 min-h-screen">
        <div className="text-white p-4 flex justify-between items-center pt-6">
        <h1 className="text-2xl font-bold">Blue</h1>
        {user && user.images?.length > 0 ? (
          <img
          src="{user.images[0].url}"
          alt="Profile"
          className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className='w-10 h-10 rounded-full bg-gray-600 roundedfull ml-2' />
        )}
        <button>
          <a href="https://www.spotify.com/logout" className="bg-green-500 hover:bg-green-700 text-white  text-[12px] font-bold py-1.5 px-2 rounded">
            Logout
          </a>
        </button>
        </div>
        <div className='relative flex justify-center items-center mx-4'>
          <input 
          type="text"
          className="p-1 rounded bg-slate-600 w-full mt-4  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder= "Find your favorite tracks or artists"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
           />

        {showDropdown && tracks.length > 0 && (
          <ul className="absolute top-full mt-1 w-full  bg-white text-black shadow-lg rounded z-50 max-h-64 overflow-y-auto">
            {tracks.map((track) => (
              <li key={track.id} className="p-2 hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-2">
                  {track.album?.images?.[2]?.url && (
                    <img src={track.album.images[2].url} alt={track.name} className="w-8 h-8 rounded" />
                  )}
                  <div>
                    <div className="font-semibold">{track.name}</div>
                    <div className="text-sm text-gray-600">{track.artists.map((a) => a.name).join(", ")}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </>
  )
}

export default App
