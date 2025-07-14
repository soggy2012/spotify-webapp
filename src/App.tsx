import { use, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import './App.css'
import './index.css'


// Type definitions for Spotify API data structures
type Artist = {name: string;};
type AlbumImage = {url: string;};
type Album = {images: AlbumImage[];};
type Track = {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
};


const App = () => {
  // State variables 
  const [user, setUser] = useState<any>(null);                                    // Spotify user object
  const [input, setInput] = useState<string>("");                                 // Search input value  
  const [tracks, setTracks] = useState<Track[]>([]);                              // List of tracks fetched from Spotify                
  const [showDropdown, setShowDropdown] = useState(false);                        // Controls visibility of dropdown
  const [playlist, setPlaylist] = useState<Track[]>([]);                         // Current playlist (local state)
  const [playlistName, setPlaylistName] = useState<string>("My Playlist");        // Playlist name input
  const [isSaving, setIsSaving] = useState(false);                               // Tracks saving state for button feedback                  
  const [saveSuccess, setSaveSuccess] = useState(false);                         // Tracks whether save succeeded
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);                // User's playlists 

  const token = localStorage.getItem("access_token");


  // Function to add a track to the playlist
  // Checks if the track is already in the playlist before adding
  const addToPlaylist = (track: Track) => {
    if(!playlist.find((t) => t.id === track.id)) {
      setPlaylist((prev) => [...prev, track]);
    }
  };


  // Function to remove a track from the playlist
  const removeFromPlaylist = (trackId: string) => {
    setPlaylist((prev) => prev.filter((t) => t.id !== trackId));
  };

  const savePlaylistToSpotify = async () => {
    if (!token || !user) {
      alert("You must be logged in to save a playlist.");
      return
    }

    if (playlist.length === 0) {
      alert("Your playlist is empty.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Create a new playlist in the user's account
      const createRes = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName || "My Playlist",
          description: "Created with Blue",
          public: false,
        }),
      });

      if(!createRes.ok) throw new Error("Failed to create playlist");

      const playlistData = await createRes.json();

      // Add selected tracks to the new playlist
      const trackUris = playlist.map((track) => `spotify:track:${track.id}`);

      const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          uris: trackUris 
        }),
      });

      if (!addTracksRes.ok) throw new Error("Failed to add tracks to playlist");

      setSaveSuccess(true);  // Mark save as successful

    } catch (error) {
      console.error("Error saving playlist:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to reset the playlist state
  const resetPlaylist = () => {
  setPlaylist([]);
  setPlaylistName("My Playlist");
  setSaveSuccess(false);
  };

  // Effect: Fetch user data from spotify API when token is available
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

        // Fetch user's playlists after user profile loaded
        const playlistsRes = await fetch("https://api.spotify.com/v1/me/playlists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!playlistsRes.ok) throw new Error("Failed to fetch playlists");
        const playlistsData = await playlistsRes.json();
        setUserPlaylists(playlistsData.items);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    fetchUserData();
   }, [token]);

   // Effect: Search Spotify tracks based on input with debounce
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

        {/* --- Top bar --- */}

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


        <div className='mx-4'>
          {/* --- Search input + dropdown --- */}
          <div className='relative'>
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
                  <li key={track.id} className="p-2 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      {track.album?.images?.[2]?.url && (
                        <img src={track.album.images[2].url} alt={track.name} className="w-8 h-8 rounded" />
                      )}
                      <div className='flex justify-between w-full items-center'>
                        <div>
                          <div className="font-semibold">{track.name}</div>
                          <div className="text-sm text-gray-600">{track.artists.map((a) => a.name).join(", ")}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToPlaylist(track);
                          }}
                          className='text-green 500 hover:text-green-700 p-2 text-lg font-bold'
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* --- Playlist section --- */}

          {playlist.length > 0 && (
            <div className="mt-4 p-4 bg-gray-700 rounded text-white flex flex-col shadow-2xl ">
              <input 
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="text-lg font-bold mb-4 p-1 bg-white text-black rounded-2xl text-center shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              
              {/* --- Playlist track list --- */}

              <ul>
                {playlist.map((track) => (
                  <li key={track.id} className="text-sm mb-1">
                    <div className='flex  justify-between items-center my-2 py-1 px-4 bg- rounded-xl bg-gray-600'>
                      <div className='flex items-center gap-2'>
                        {track.album?.images?.[2]?.url && (
                        <img src={track.album.images[2].url} alt={track.name} className="w-8 h-8 rounded" />
                        )}
                        {track.name} - {track.artists.map((a) => a.name).join(", ")}
                      </div>
                      <button
                      onClick={() => removeFromPlaylist(track.id)} 
                      className="text-red 500 hover:text-red-700 p-2 text-lg font-bold">
                        x
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

            {/* --- Save to Spotify button and reset link --- */}

            <div className="flex flex-col items-center mt-4">
              <button
                onClick={savePlaylistToSpotify}
                disabled={isSaving || saveSuccess}
                className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center 
                            ${(isSaving || saveSuccess) && "opacity-50 cursor-not-allowed"}`}
                >
                  {saveSuccess ? (
                    <>
                      Saved!
                    </>
                  ) : isSaving ? (
                    <>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSpotify} className="mr-2" />
                      Save to Spotify
                    </>
                  )}
              </button>
              
              {saveSuccess && (
              <button
                onClick={resetPlaylist}
                className="mt-2 text-sm text-gray-400 hover:underline"
              >
                 Click here to reset playlist
              </button>
              )}
            </div>
          </div>
        )}

        {/* --- User playlists section (already saved playlists) --- */}
        {userPlaylists.length > 0 && (
          <div className="mt-4 p-4 bg-gray-700 rounded text-white">
            <h2 className="text-lg font-bold mb-2">Your Playlists</h2>
            <ul>
              {userPlaylists.map((pl) => (
                <li key={pl.id} className="text-sm mb-1 flex items-center gap-2 my-2">
                  {pl.images?.[0]?.url && (
                    <img src={pl.images[0].url} alt={pl.name} className="w-8 h-8 rounded inline-block mr-2" />
                  )}
                  <span>{pl.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default App
