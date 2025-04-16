import React, { createContext, useState, useContext } from "react";

interface SelectedVideosContextType {
  selectedVideos: string[];
  setSelectedVideos: React.Dispatch<React.SetStateAction<string[]>>;
}

const SelectedVideosContext = createContext<SelectedVideosContextType | undefined>(undefined);

export const SelectedVideosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  return (
    <SelectedVideosContext.Provider value={{ selectedVideos, setSelectedVideos }}>
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