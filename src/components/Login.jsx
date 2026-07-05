import { GoogleLogin } from '@react-oauth/google';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Login = () => {
  const usenavigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential, // Send the Google ID Token to backend
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with backend server");
      }

      const data = await response.json();
      console.log("Backend Auth Success:", data);

      // Save credentials into React state & localStorage via context helper
      login(data.user, data.token);

      usenavigate('/dashboard');
    } catch (error) {
      console.error("Auth sync error:", error);
      alert("Sign-in failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In failed");
    alert("Google Sign-In failed. Please try again.");
  };

  return (
    <div className='text-white flex justify-center items-center h-screen relative bg-[#060814]'>
      {/* Background glow effects to match home page */}
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className='border border-gray-800 rounded-2xl p-8 w-[400px] bg-[#0c0e22]/90 backdrop-blur-xl text-center flex flex-col items-center shadow-2xl relative z-10'>
        {/* Dismiss Button */}
        <button
          onClick={() => usenavigate('/')}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className='text-3xl font-bold my-5 font-Fredoka'>Welcome to Quizio</h2>
        <p className='text-gray-400 font-light mb-8 text-sm'>
          Login with your Google account to save your generated quizzes, view performance, and log scores.
        </p>
        
        <div className="my-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_blue"
            shape="pill"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;