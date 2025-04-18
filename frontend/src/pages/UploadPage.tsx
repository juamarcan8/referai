import React, { useState, useEffect } from "react";
import { useSelectedVideos } from "../context/SelectedVideosContext";
import { useNavigate } from "react-router-dom";
import { uploadClip } from "../api/upload";  // Ensure uploadClip is correctly imported

export default function UploadPage() {
    const { selectedVideos, setSelectedVideos } = useSelectedVideos();
    const navigate = useNavigate();
    const [uploadProgress, setUploadProgress] = useState<number[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);  // Save uploaded files

    const exampleVideos = [
        { id: 1, url: "/videos/SampleVideo_360x240_1mb.mp4", label: "Foul Example 1" },
        { id: 2, url: "/videos/SampleVideo_720x480_1mb.mp4", label: "No Foul Example 1" },
    ];

    useEffect(() => {
        console.log("Selected videos changed:", selectedVideos);
      }, [selectedVideos]);

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

    // Handle the "Continue" action and upload files
    const handleContinue = async () => {
        if (selectedVideos.length >= 2 && selectedVideos.length <= 4) {
            try {
                const uploadedFilenames: string[] = [];

                // Upload selected user files
                for (let i = 0; i < uploadedFiles.length; i++) {
                    const file = uploadedFiles[i];
                    const filename = await uploadClip(file, (percent) => {
                        setUploadProgress((prev) => {
                            const copy = [...prev];
                            copy[i] = percent;
                            return copy;
                        });
                    });
                    uploadedFilenames.push(filename);
                }

                // You can use the uploaded filenames for further processing
                console.log("Uploaded filenames:", uploadedFilenames);

                navigate("/main");
            } catch (error) {
                console.error("Upload failed", error);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 px-4 py-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Clip selection</h1>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
                {/* Upload Section */}
                <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Upload your clips
                    </h2>
                    <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center text-gray-500 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition">
                        <input
                            type="file"
                            accept="video/*"
                            multiple
                            className="hidden"
                            id="video-upload"
                            onChange={handleUpload}
                        />
                        <label htmlFor="video-upload" className="cursor-pointer block">
                            Drag and drop videos here or <span className="text-blue-600">browse</span>
                        </label>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Or pick from examples
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {exampleVideos.map((video, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleExampleSelect(video)}
                                className="cursor-pointer rounded overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-blue-400 transition"
                            >
                                <video src={video.url} className="w-full h-24 object-cover" muted />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Selected Clips Preview */}
            {selectedVideos.length > 0 && (
                <div className="w-full max-w-5xl mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Selected Clips</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedVideos.map((video, idx) => (
                            <div key={idx} className="relative group border rounded overflow-hidden">
                                <video
                                    src={video}
                                    className="w-full h-24 object-cover"
                                    controls
                                    muted
                                />
                                {/* Remove Button */}
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
                <div className="w-full max-w-2xl mt-6">
                    <h3 className="text-md text-gray-800 dark:text-gray-300 mb-2">Upload Progress</h3>
                    <div className="space-y-2">
                        {uploadProgress.map((progress, idx) => (
                            <div key={idx} className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
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
                className={`mt-8 px-6 py-3 rounded-lg text-white font-semibold transition 
        ${selectedVideos.length >= 2 && selectedVideos.length <= 4
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'}`}
            >
                Continue
            </button>
        </div>
    );
}
