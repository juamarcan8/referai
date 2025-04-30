import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

export default function MainPage() {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const handlePrediction = () => {
    setResult("Foul (85%)");
  };

  // Retrieves the id of the selected action from localStorage
  useEffect(() => {
    const fetchClips = async () => {
      const stored = localStorage.getItem("last_action_id");
      if (!stored) return;
      setActionId(Number(stored));
      localStorage.removeItem("last_action_id");
  
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated");
        return;
      }
  
      try {
        const res = await fetch(`${API_URL}/action/${stored}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Agrega el token JWT aquí
          },
        });
  
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to fetch clips");
        }
  
        const data = await res.json();
        const videoURLs = data.clips.map((clip: any) => {
          const binary = Uint8Array.from(atob(clip.content), (c) => c.charCodeAt(0));
          return URL.createObjectURL(new Blob([binary], { type: "video/mp4" }));
        });
  
        setSelectedVideos(videoURLs);
      } catch (error) {
        console.error("Error fetching clips:", error);
        alert("Error fetching clips: " + error.message);
      }
    };
  
    fetchClips();
  }, []);

  // Play or pause all videos
  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      const newState = !prev;
      videoRefs.current.forEach((video) => {
        if (newState) {
          video.play();
        } else {
          video.pause();
        }
      });
      return newState;
    });
  };

  // Sync all videos to the same time
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    videoRefs.current.forEach((video) => {
      video.currentTime = time;
    });
  };

  // Update the current time when any video updates
  useEffect(() => {
    const handleSync = () => {
      if (videoRefs.current[0]) {
        // Actualiza el estado con el tiempo actual del primer video
        setCurrentTime(videoRefs.current[0].currentTime);
      }
    };

    // Agrega el evento `timeupdate` a todos los videos
    videoRefs.current.forEach((video) => {
      video.addEventListener("timeupdate", handleSync);
    });

    // Limpia los eventos al desmontar el componente
    return () => {
      videoRefs.current.forEach((video) => {
        video.removeEventListener("timeupdate", handleSync);
      });
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row h-screen">
        {/* Video Grid Section */}
        <div
          className={`flex-[3] grid gap-2 p-2 bg-white dark:bg-slate-800 ${selectedVideos.length === 2 ? "grid-cols-1 grid-rows-2" : "grid-cols-2 grid-rows-2"
            }`}
        >
          {selectedVideos.map((video, index) => (
            <div
              key={index}
              className={`rounded-md overflow-hidden ${selectedVideos.length === 3 && index === 2 ? "col-span-2" : ""
                }`}
            >
              <video
                muted
                src={video}
                controls={false}
                ref={(el) => {
                  if (el) videoRefs.current[index] = el;
                }}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Side Panel */}
        <div className="flex-[1] p-4 h-full bg-white dark:bg-slate-900 overflow-auto">
          {/* Controls */}
          <div className="grid grid-cols-3 mb-4 gap-2">
            {/* Range Input */}
            <div className="col-span-2 flex items-center">
              <input
                type="range"
                min="0"
                max={videoRefs.current[0]?.duration || 0}
                value={currentTime}
                onChange={(e) => handleTimeUpdate(Number(e.target.value))}
                className="w-full accent-blue-700"
                aria-label="Video progress"
              />
            </div>

            {/* Play/Pause Button */}
            <div className="col-span-1 flex justify-center items-center">
              <button
                onClick={togglePlayPause}
                aria-pressed={isPlaying}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>
          </div>

          {/* Prediction Result */}
          <div className="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10 mb-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white mb-1">Prediction Result</h3>
              {result ? (
                <p className="text-lg text-gray-700 dark:text-gray-200">{result}</p>
              ) : (
                <p className="text-gray-500">No prediction yet</p>
              )}
            </div>
          </div>

          {/* Run Prediction Button */}
          <button
            onClick={handlePrediction}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Run Prediction
          </button>
        </div>
      </div>
    </>

  );
}
