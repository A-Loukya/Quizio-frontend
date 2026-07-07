import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Home from "./components/Home";
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import QuizPage from './components/QuizPage ';
import ChallengeLobby from './components/ChallengeLobby';
import ChallengePlay from './components/ChallengePlay';
import { API_BASE_URL } from './config';
import { Brain } from 'lucide-react';

const appRoute = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/quiz',
    element: <QuizPage />
  },
  {
    path: '/challenge/:lobbyCode',
    element: <ChallengeLobby />
  },
  {
    path: '/challenge/:lobbyCode/play',
    element: <ChallengePlay />
  }
]);

function App() {
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    let active = true;
    const checkServer = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (active) {
          setServerStatus('ready');
        }
      } catch (error) {
        console.warn("Backend server is sleeping, retrying in 3s...", error);
        if (active) {
          setTimeout(checkServer, 3000);
        }
      }
    };

    checkServer();
    return () => {
      active = false;
    };
  }, []);

  if (serverStatus === 'checking') {
    return (
      <div className="min-h-screen bg-[#060814] text-white flex flex-col justify-center items-center p-6 text-center select-none font-sans relative overflow-hidden">
        {/* Radial glow background spots */}
        <div className="absolute top-1/4 left-[-10%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-[-10%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative backdrop-blur-xl bg-[#0c0e22]/80 border border-white/10 p-8 rounded-3xl max-w-sm shadow-2xl flex flex-col items-center z-10">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center">
              <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
          </div>
          
          <h3 className="text-xl font-bold font-Fredoka mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-300">
            Waking Up AI Engine
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed font-light mb-6">
            Quizio is hosted on a free cloud server that goes to sleep during periods of inactivity. This connection process may take up to 45 seconds. We appreciate your patience! 🚀
          </p>
          
          <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/30 border border-cyan-500/10 px-3.5 py-2 rounded-full animate-pulse tracking-wide">
            ESTABLISHING CONNECTION...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#070916]">
      <AuthProvider>
        <RouterProvider router={appRoute} />
      </AuthProvider>
    </div>
  );
}

export default App;
