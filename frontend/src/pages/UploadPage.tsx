import React, { useState, useEffect } from "react";
import { useSelectedVideos } from "../context/SelectedVideosContext";
import { useNavigate } from "react-router-dom";
import { uploadClips } from "../api/upload";
import Navbar from "../components/Navbar";
import { getLastAction } from "../api/action";

export default function UploadPage() {
    const { selectedVideos, setSelectedVideos } = useSelectedVideos();
    const navigate = useNavigate();
    const [uploadProgress, setUploadProgress] = useState<number[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [lastAction, setLastAction] = useState<{ action_id: number; clips: { id: number; content: string }[] } | null>(null);

    useEffect(() => {
        const fetchLastAction = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not authenticated");

                const data = await getLastAction(token);
                setLastAction(data);
            } catch (error) {
                console.error("Failed to fetch last action:", error);
            }
        };

        fetchLastAction();
    }, []);

    // Handle file uploads
    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileArray = Array.from(files).slice(0, 4); // Limit to 4 files
            setUploadedFiles(fileArray);

            const objectURLs = fileArray.map(file => URL.createObjectURL(file));
            setSelectedVideos(prev => {
                prev.forEach(url => URL.revokeObjectURL(url));  // Clear previous URLs
                return objectURLs;
            });
        }
    };

    // Handle selecting an example video
    const handleExampleSelect = (video: { url: string }) => {
        if (selectedVideos.length < 4) {
            setSelectedVideos(prev => [...prev, video.url]);
        }
    };

    // Remove a selected video
    const removeClip = (indexToRemove: number): void => {
        setSelectedVideos((prev: string[]) =>
            prev.filter((_, idx) => idx !== indexToRemove)
        );
    };

    const handleContinue = async () => {
        if (selectedVideos.length >= 2 && selectedVideos.length <= 4) {
            try {
                const token = localStorage.getItem("token");

                // Validar que sea un JWT real
                if (!token || !token.includes('.') || token.split('.').length !== 3) {
                    throw new Error("User not authenticated or token malformed");
                }

                const res = await uploadClips(uploadedFiles, token);
                localStorage.setItem("last_action_id", res.action_id);
                navigate("/");
            } catch (error) {
                console.error("Upload failed", error);
                alert("Upload failed: " + error.message);
            }
        }
    };

    return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 px-4 py-8">
        {/* Page Titles */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Clip Selection
        </h1>
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-8">
          Select between 2 and 4 clips to continue
        </h2>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
          {/* Upload Area */}
          <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex flex-col">
  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
    Upload Your Clips
  </h3>
  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 text-center text-gray-500 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition">
    <input
      type="file"
      accept="video/*"
      multiple
      className="hidden"
      id="video-upload"
      onChange={handleUpload}
    />
    <label htmlFor="video-upload" className="cursor-pointer block">
      Drag & drop your videos here or{" "}
      <span className="text-blue-600 hover:underline">browse</span>
    </label>
  </div>
</div>

          {/* Last Action Preview */}
          <div
            className={`flex-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md ${
              lastAction ? "hover:bg-slate-700 cursor-pointer" : "opacity-60"
            } transition`}
            onClick={() => {
              if (lastAction) {
                localStorage.setItem(
                  "last_action_id",
                  lastAction.action_id.toString()
                );
                navigate("/");
              }
            }}
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Your Last Action
            </h3>
            {lastAction ? (
              <div className="grid grid-cols-2 gap-4">
                {lastAction.clips.map((clip: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <video
                      src={`data:video/mp4;base64,${clip.content}`}
                      className="w-full h-24 object-cover"
                      controls
                      muted
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-300">
                No previous actions found.
              </p>
            )}
          </div>
        </div>

        {/* Selected Clips */}
        {selectedVideos.length > 0 && (
          <div className="w-full max-w-5xl mt-10">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Selected Clips
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedVideos.map((video, idx) => (
                <div
                  key={idx}
                  className="relative group border border-gray-300 dark:border-gray-600 rounded overflow-hidden"
                >
                  <video
                    src={video}
                    className="w-full h-24 object-cover"
                    controls
                    muted
                  />
                  <button
                    onClick={() => removeClip(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    title="Remove clip"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="w-full max-w-2xl mt-8">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Progress
            </h4>
            <div className="space-y-2">
              {uploadProgress.map((progress, idx) => (
                <div
                  key={idx}
                  className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3"
                >
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          disabled={selectedVideos.length < 2 || selectedVideos.length > 4}
          onClick={handleContinue}
          className={`mt-10 px-6 py-3 rounded-lg text-white font-semibold transition ${
            selectedVideos.length >= 2 && selectedVideos.length <= 4
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </>
  );
}
