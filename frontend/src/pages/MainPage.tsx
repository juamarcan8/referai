// frontend/src/pages/MainPage.tsx
import React, { useState, useRef, useEffect } from "react";

interface VideoClip {
  id: number;
  url: string;
}

// Dummy video clips for demonstration
const dummyVideos: VideoClip[] = [
  { id: 1, url: "/videos/SampleVideo_360x240_1mb.mp4" },
  { id: 2, url: "/videos/SampleVideo_360x240_1mb.mp4" },
  { id: 3, url: "/videos/SampleVideo_360x240_1mb.mp4" },
  { id: 4, url: "/videos/SampleVideo_360x240_1mb.mp4" },
  // Uncomment or add more objects to simulate 3 or 4 clips.
];

export default function MainPage() {
  const [videos] = useState<VideoClip[]>(dummyVideos);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handlePrediction = () => {
    setResult("Foul (85%)");
  };

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
    <div className="flex h-screen">
      {/* Video Grid Section */}
      <div
        className="flex-[3] grid"
        style={{
          display: "items-center",
          gridTemplateColumns: videos.length === 2 ? "1fr" : "1fr 1fr",
          gridTemplateRows: videos.length <= 2 ? "1fr 1fr" : "1fr 1fr",
          gridTemplateAreas:
            videos.length === 2
              ? `
                "video1"
                "video2"
              `
              : videos.length === 3
              ? `
                "video1 video2"
                "video3 video3"
              `
              : `
                "video1 video2"
                "video3 video4"
              `,
        }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className=" border border-indigo-800 -md"
            style={{
              gridArea: `video${index + 1}`,
            }}
          >
            <video src={video.url} controls={false} ref={(el) => { if (el) videoRefs.current[index] = el; }} className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* Side Panel */}
      <div className="flex-[1] p-4 h-full">
        <div className="grid grid-cols-3 mb-4">
          {/* Input Range */}
          <div className="col-span-2 flex justify-center items-center">
            <input
              type="range"
              min="0"
              max={videoRefs.current[0]?.duration || 0}
              value={currentTime}
              onChange={(e) => handleTimeUpdate(Number(e.target.value))}
              className="w-full bg-blue-700"
            />
          </div>

          {/* Play/Pause Button */}
          <div className="col-span-1 flex justify-center items-center">
            <button
              onClick={togglePlayPause}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
          </div>
        </div>

        <button
          onClick={handlePrediction}
          className="w-full py-2 mb-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Run Prediction
        </button>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="mb-2 font-bold">Prediction Result</h3>
          {result ? (
            <p className="text-lg">{result}</p>
          ) : (
            <p>No prediction yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
