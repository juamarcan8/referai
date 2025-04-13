// frontend/src/pages/MainPage.tsx
import React, { useState } from "react";

interface VideoClip {
  id: number;
  url: string;
}

// Dummy video clips for demonstration
const dummyVideos: VideoClip[] = [
  { id: 1, url: "" },
  { id: 2, url: "" },
  // Uncomment or add more objects to simulate 3 or 4 clips.
];

export default function MainPage() {
  // You could eventually manage the video list state from context or props
  const [videos] = useState<VideoClip[]>(dummyVideos);
  const [result, setResult] = useState<string | null>(null);

  // This function simulates the prediction when clicking the button.
  const handlePrediction = () => {
    // Dummy implementation; later, integrate with backend API
    setResult("Foul (85%)");
    // Optionally, show pop-ups/alerts for status
  };

  return (
    <div className="flex gap-8 p-8">
      {/* Video Grid Section */}
      <div className="flex-1 grid gap-4"
           style={{
             gridTemplateColumns:
               videos.length === 2 ? "repeat(2, minmax(0, 1fr))" :
               videos.length === 3 ? "repeat(3, minmax(0, 1fr))" :
               videos.length === 4 ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))"
           }}>
        {videos.map((video) => (
          <div key={video.id} className="relative border border-gray-300 rounded-md">
            <video
              src={video.url}
              controls
              className="w-full h-auto rounded-md"
            />
          </div>
        ))}
      </div>

      {/* Side Panel */}
      <div className="w-1/3 p-4 bg-gray-100 rounded-md shadow-md">
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
