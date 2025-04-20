import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const fullName = localStorage.getItem("name");
  const email = localStorage.getItem("email");
  const picture = localStorage.getItem("picture");
  const navigate = useNavigate();

  const handleLogout = () => {
    // console.log('Logging out');
    localStorage.clear();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-full mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-pixelfont">My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-start">
              {/* Profile Image */}
              <div className="mr-6">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                  {picture ? (
                    <div className="rounded-full">
                      <img src={`${picture}`} className="rounded-full" />
                    </div>
                  ) : (
                    <User size={36} />
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{fullName}</h2>
                    <p className="text-gray-400 mt-1">{email}</p>
                  </div>
                </div>
                {/* <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-500">
                    Member since April 2025
                  </p>
                </div> */}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="px-6 py-4 bg-gray-800 flex items-center border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex justify-center items-center text-gray-300 hover:text-teal-300"
            >
              <LogOut size={20} className="mr-2" color="#EF5350" />
              <span className="font-semibold text-red-400">Logout</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
