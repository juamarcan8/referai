import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SelectedVideosProvider } from "./context/SelectedVideosContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import UploadPage from "./pages/UploadPage";
import './index.css';
import { PublicRoute } from "./auth/PublicRoute";
import { PrivateRoute } from "./auth/PrivateRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
    <SelectedVideosProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <MainPage />
            </PrivateRoute>} />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>} />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/upload" element={
            <PrivateRoute>
              <UploadPage />
            </PrivateRoute>} />
        </Routes>
      </Router>
    </SelectedVideosProvider>
    </div>
  );
}
