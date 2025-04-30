import React, { useState, useRef, useEffect } from "react";
import { useSelectedVideos } from "../context/SelectedVideosContext";
import { sendForPrediction, SinglePrediction } from "../api/predict";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

export default function MainPage() {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [predictions, setPredictions] = useState<SinglePrediction[] | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrediction = async () => {
    // Extrae sólo el nombre de archivo de la URL
    const filenames = selectedVideos.map((url) => url.split("/").pop()!);

    setLoading(true);
    try {
      const data = await sendForPrediction(filenames);
      setPredictions(data.results);
    } catch (err) {
      console.error("Prediction error", err);
    } finally {
      setLoading(false);
    }
  };

  // Retrieves the id of the selected action from localStorage
  useEffect(() => {
    const fetchClips = async () => {
      const stored = localStorage.getItem("last_action_id");
      if (!stored) return;

      setIsLoading(true);

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
            Authorization: `Bearer ${token}`,
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
      } finally {
        setIsLoading(false);
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
          {isLoading ? (
            <div className="col-span-2 row-span-2 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            selectedVideos.map((video, index) => (
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
            ))
          )}
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
        <div className="mt-6 space-y-4">
          {loading ? (
            // Animación de pulsación mientras está cargando
            <div className="mx-auto w-full max-w-sm rounded-md border border-blue-300 p-4">
              <div className="flex animate-pulse space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 rounded bg-gray-200"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 h-2 rounded bg-gray-200"></div>
                      <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                    </div>
                    <div className="h-2 rounded bg-gray-200"></div>
                    <div className="h-2 rounded bg-gray-200"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                      <div className="col-span-2 h-2 rounded bg-gray-200"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3 h-2 rounded bg-gray-200"></div>
                      <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Resultados reales después de cargar
            predictions &&
            predictions.map((pred) => (
              <div
                key={pred.filename}
                className="bg-white p-4 rounded shadow-sm border"
              >
                <h4 className="font-semibold">{pred.filename}</h4>
                <p>
                  <strong>Foul:</strong>{" "}
                  {pred.is_foul ? "Yes" : "No"} (
                  {pred.foul_confidence.toFixed(1)}% vs{" "}
                  {pred.no_foul_confidence.toFixed(1)}%)
                </p>
                <p className="mt-2">
                  <strong>Severity:</strong>{" "}
                  No card {pred.severity.no_card.toFixed(1)}%,{" "}
                  Red card {pred.severity.red_card.toFixed(1)}%,{" "}
                  Yellow card {pred.severity.yellow_card.toFixed(1)}%
                </p>
              </div>
            ))
          )}
        </div>

        {/* Run Prediction Button */}
        <button
          onClick={handlePrediction}
          disabled={loading || selectedVideos.length === 0}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Predicting...
            </>
          ) : (
            "Run Prediction"
          )}
        </button>
        </div>
      </div>
    </>

  );
}
