// components/Navbar.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center">
      <h1 className="text-xl font-semibold">referai</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
