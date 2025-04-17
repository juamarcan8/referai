import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SelectedVideosProvider } from "./context/SelectedVideosContext";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import UploadPage from "./pages/UploadPage";
import './index.css'; 

export default function App() {
  return (
    <SelectedVideosProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </Router>
    </SelectedVideosProvider>
  );
}
