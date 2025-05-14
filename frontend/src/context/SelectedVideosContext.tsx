import React, { createContext, useState, useContext } from "react";

interface SelectedVideosContextType {
  selectedVideos: string[];
  setSelectedVideos: React.Dispatch<React.SetStateAction<string[]>>;
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const SelectedVideosContext = createContext<SelectedVideosContextType | undefined>(undefined);

export const SelectedVideosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  return (
    <SelectedVideosContext.Provider value={{ selectedVideos, setSelectedVideos, uploadedFiles, setUploadedFiles }}>
      {children}
    </SelectedVideosContext.Provider>
  );
};

export const useSelectedVideos = () => {
  const context = useContext(SelectedVideosContext);
  if (!context) {
    throw new Error("useSelectedVideos must be called in SelectedVideosProvider");
  }
  return context;
};