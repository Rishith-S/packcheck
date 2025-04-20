import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import GoogleIcon from "../SVG/GoogleIcon";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDetails } from "../utils/Callback";

export default function PackCheckLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!email || !password) {
      setError("Please enter both email and password");
    } else {
      try {
        setError("");
        const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/login/email-and-password`,{
          email,
          password
        },{withCredentials:true});
        if(res.data.status==='error'){
          setError(res.data.message);
        } else{
          const userDetails: UserDetails = res.data as unknown as UserDetails;
          localStorage.setItem("name", userDetails.name);
          localStorage.setItem("email", userDetails.email);
          localStorage.setItem("accessToken", userDetails.accessToken);
          localStorage.setItem("allergies", JSON.stringify(userDetails.allergies));
          navigate("/");
        }
      } catch (error) {
        console.log(error);
        setError(error instanceof Error ? error.message : "An unexpected error occurred");
      } finally{
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = (await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/url/login`)) as any;
      window.location.assign(response.data.url);
    } catch (error) {
      console.log(error);
      navigate('/auth/login');
    }
    finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <div className="flex flex-col justify-center w-full max-w-md p-8 mx-auto rounded-lg shadow-md text-white">
        <div className="text-center mb-8">
          {/* Company Logo */}
          <div className="font-pixelfont text-6xl text-teal-300 flex justify-center mb-2">
            {/* <div className="bg-teal-300 text-black font-bold rounded-lg p-2 text-xl"> */}
            PackCheck
            {/* </div> */}
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-md flex items-center text-red-300">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-teal-300 focus:border-teal-300 text-white"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-teal-300 focus:border-teal-300 text-white"
              placeholder="••••••••"
            />
            <div className="flex items-center justify-end my-1">
              <a href="#" className="text-sm text-teal-300 hover:text-teal-200">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-teal-300 text-black font-medium rounded-md hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-1">
          <div className="text-md text-gray-400 flex flex-row">
            Don't have an account?{" "}
          </div>
          <div
            onClick={() => {navigate('/auth/signup')}}
            className="cursor-pointer font-pixelfont text-teal-300 hover:text-teal-200"
          >
            Sign up
          </div>
        </div>
      </div>
    </div>
  );
}
