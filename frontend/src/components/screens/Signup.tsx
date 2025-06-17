import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import GoogleIcon from "../SVG/GoogleIcon";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDetails } from "../utils/Callback";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  // Update password strength when password changes
  useEffect(() => {
    let strength = 0;
    if (hasMinLength) strength++;
    if (hasUppercase) strength++;
    if (hasLowercase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;

    setPasswordStrength(strength);
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!fullName || !email || !password || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }
  
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
  
      if (passwordStrength < 3) {
        setError("Please use a stronger password");
        return;
      }

      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/signup/email-and-password`,{
        name:fullName,
        email:email,
        password:password
      },{withCredentials:true})

      if(res.status===404 || res.status===500){
        setError(res.data.message);
      } else{
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
        setError("Authentication failed. Please try again.");
      } else {
        setError(error instanceof Error ? error.message : "An unexpected error occurred");
      }
    } finally{
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = (await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/auth/url/signup`
      )) as any;
      window.location.assign(response.data.url);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please try again.");
      } else {
        navigate('/auth/signup');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <div className="flex flex-col justify-center w-full max-w-md p-8 mx-auto rounded-lg shadow-md text-white my-8">
        <div className="text-center mb-8">
          {/* Company Logo */}
          <div className="flex justify-center text-teal-300 text-6xl font-pixelfont mb-2">
            PackCheck
          </div>
          <h2 className="text-2xl font-bold text-white">Create your account</h2>
          <p className="text-gray-400 mt-1">Start tracking your food</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-md flex items-center text-red-300">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-teal-300 focus:border-teal-300 text-white"
              placeholder="John Doe"
            />
          </div>

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
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md  focus:ring-teal-300 focus:border-teal-300 text-white"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md  focus:ring-teal-300 focus:border-teal-300 text-white"
              placeholder="••••••••"
            />

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-full rounded-full ${
                        i < passwordStrength
                          ? passwordStrength < 3
                            ? "bg-red-500"
                            : passwordStrength < 5
                            ? "bg-yellow-500"
                            : "bg-green-500"
                          : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        hasMinLength ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {hasMinLength ? <CheckCircle className="h-4 w-4" /> : "•"}
                    </span>
                    <span
                      className={
                        hasMinLength ? "text-gray-300" : "text-gray-500"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        hasUppercase ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {hasUppercase ? <CheckCircle className="h-4 w-4" /> : "•"}
                    </span>
                    <span
                      className={
                        hasUppercase ? "text-gray-300" : "text-gray-500"
                      }
                    >
                      Uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        hasLowercase ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {hasLowercase ? <CheckCircle className="h-4 w-4" /> : "•"}
                    </span>
                    <span
                      className={
                        hasLowercase ? "text-gray-300" : "text-gray-500"
                      }
                    >
                      Lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        hasNumber ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {hasNumber ? <CheckCircle className="h-4 w-4" /> : "•"}
                    </span>
                    <span
                      className={hasNumber ? "text-gray-300" : "text-gray-500"}
                    >
                      Number
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        hasSpecialChar ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {hasSpecialChar ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        "•"
                      )}
                    </span>
                    <span
                      className={
                        hasSpecialChar ? "text-gray-300" : "text-gray-500"
                      }
                    >
                      Special character
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md  focus:ring-teal-300 focus:border-teal-300 text-white"
              placeholder="••••••••"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-400">
                Passwords do not match
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-teal-300 text-black font-medium rounded-md hover:bg-teal-400 focus:outline-none  focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
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
                Or sign up with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 font-medium text-white hover:bg-gray-700 focus:outline-none  focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              <GoogleIcon />
              Sign up with Google
            </button>
          </div>
        </div>

        <div className="mt-8 text-center flex flex-row items-center justify-center gap-1">
          <p className="text-sm text-gray-400">Already have an account? </p>
          <div
            onClick={() => {
              navigate("/auth/login");
            }}
            className="font-medium text-teal-300 hover:text-teal-200 font-pixelfont"
          >
            Sign in
          </div>
        </div>

        {/* <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            By creating an account, you agree to our{' '}
            <a href="#" className="text-teal-300 hover:text-teal-200">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-teal-300 hover:text-teal-200">
              Privacy Policy
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
}
