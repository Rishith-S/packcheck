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
        const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/login/email-and-password`, {
          email,
          password
        }, { withCredentials: true });
        if (res.data.status === 'error') {
          setError(res.data.message);
        } else {
          const userDetails: UserDetails = res.data as unknown as UserDetails;
          localStorage.setItem("name", userDetails.name);
          localStorage.setItem("email", userDetails.email);
          localStorage.setItem("accessToken", userDetails.accessToken);
          localStorage.setItem("allergies", JSON.stringify(userDetails.allergies));
          navigate("/");
        }
      } catch (error: any) {
        console.log(error);
        if (error.response?.status === 401) {
          setError("Invalid email or password");
        } else {
          setError(error instanceof Error ? error.message : "An unexpected error occurred");
        }
      } finally {
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
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please try again.");
      } else {
        navigate('/auth/login');
      }
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-black">
      <div className="hidden relative lg:flex m-8 bg-neutral-900 items-center justify-center w-1/2 rounded-3xl shadow-lg text-white">
        <div className="absolute w-[550px] h-[550px] flex items-center bg-gradient-to-r from-teal-400/30 via-teal-300/40 to-teal-400/30 rounded-full justify-center animate-spin" />
        <div className="absolute w-[450px] h-[450px] flex items-center bg-gradient-to-r from-teal-400/30 via-teal-300/40 to-teal-400/30 rounded-full justify-center animate-spin" style={{animationDirection: 'reverse'}} />
        <div className="absolute w-[400px] h-[400px] flex items-center bg-gradient-to-br from-teal-400/50 via-teal-300/60 to-teal-400/50 rounded-full justify-center animate-spin" />
        <div className="absolute w-[350px] h-[350px] flex items-center bg-gradient-to-tl from-teal-400/70 via-teal-300/80 to-teal-400/70 rounded-full justify-center animate-pulse" />
        <div className="absolute w-[320px] h-[320px] flex items-center bg-gradient-to-tr from-teal-400/60 via-teal-300/70 to-teal-400/60 rounded-full justify-center animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br from-teal-400 via-teal-300 to-teal-500 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r from-transparent via-teal-200/20 to-transparent animate-spin" style={{ animationDuration: '15s' }} />
        
        {/* Floating particles effect */}
        <div className="absolute w-[450px] h-[450px] rounded-full">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-teal-200/60 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-teal-300/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-teal-400/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-teal-200/50 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.2s' }} />
        </div>
        <div className="text-center z-10 bg-neutral-900/90 backdrop-blur-sm h-full items-center justify-center flex flex-col p-8 rounded-lg mb-8">
          <div className="font-pixelfont text-6xl text-teal-300 flex justify-center mb-2">
            PackCheck
          </div>
          <p className="text-lg text-white">Scan barcodes with PackCheck to quickly check for allergens and determine if you can eat it safely.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center min-h-screen p-8 mx-auto lg:px-16 lg:mx-0 lg:px-32 rounded-lg shadow-md text-white lg:w-1/2">
        <div className="text-center mb-8">
          <div className="flex justify-center lg:hidden font-pixelfont text-6xl text-teal-300 flex justify-center mb-2">
            PackCheck
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
            onClick={() => { navigate('/auth/signup') }}
            className="cursor-pointer font-pixelfont text-teal-300 hover:text-teal-200"
          >
            Sign up
          </div>
        </div>
      </div>
    </div>
  );
}
