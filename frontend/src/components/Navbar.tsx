import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Link, LogOut, Undo2 } from "lucide-react";
import { useSelectedVideos } from "../context/SelectedVideosContext";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { setSelectedVideos, setUploadedFiles } = useSelectedVideos();

  const handleLogout = () => {
    setSelectedVideos([]);
    setUploadedFiles([]);
    logout();
    navigate("/login");
  };

  const handleNavigateUpload = () => {
    if (location.pathname !== "/upload") {
      navigate("/upload");
    }
  }

  const isMainPage = location.pathname === "/";

  return (
    <nav className="relative flex items-center justify-between px-4 py-3 bg-gray-900 text-white shadow-md border-b border-gray-700">

      {/* Left: Upload Button */}
      {isMainPage && (
      <div className="z-10">
        <button
          onClick={handleNavigateUpload}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Undo2 size={18} />
          Upload Page
        </button>
      </div>
      )}

      {/* Center: Logo */}
      <div className="inset-0 flex justify-center items-center pointer-events-none">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <span className="text-indigo-400">refer</span>ai
        </h1>
      </div>

      {/* Right: Logout Button */}
      <div className="z-10">
        <button
          onClick={handleLogout}
          className="inset-0 flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
