import { Outlet, Link, useNavigate } from "react-router-dom";
import { Home, User, LogOut, PenSquare } from "lucide-react";
import { useAuth } from "../../components/AuthContext/AuthContext";
import { CreatePost } from "../CreatePost/CreatePost";
import { useState } from "react";

export function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen fixed border-r border-gray-200">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-blue-500">Chirp</h1>
          </div>
          <nav className="mt-4 flex flex-col gap-2">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full mx-2"
            >
              <Home className="w-6 h-6 mr-2" />
              <span>Home</span>
            </Link>
            {profile && (
              <Link
                to={`/profile/${profile.username}`}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full mx-2"
              >
                <User className="w-6 h-6 mr-2" />
                <span>Profile</span>
              </Link>
            )}
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="flex items-center px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-full mx-2"
            >
              <PenSquare className="w-6 h-6 mr-2" />
              <span>Post</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full mx-2 mt-auto"
            >
              <LogOut className="w-6 h-6 mr-2" />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 max-w-2xl">
          <main className="py-4 px-4">
            <Outlet />
          </main>
        </div>
      </div>

      
    </div>
  );
}
