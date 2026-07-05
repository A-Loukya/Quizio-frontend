import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to dashboard if logged in user attempts to visit Home or Login
        if (location.pathname === "/" || location.pathname === "/login") {
          navigate("/dashboard");
        }
      } else {
        // Redirect to home if unauthenticated user attempts to visit protected pages
        if (location.pathname !== "/" && location.pathname !== "/login") {
          navigate("/");
        }
      }
    }
  }, [user, loading, navigate, location.pathname]);

  const handleClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      console.log("Signing out user");
      logout();
      navigate("/");
    }
  };

  return (
    <div className="mx-16 my-9 flex justify-between items-center">
      <h1 
        className="text-5xl text-white font-Fredoka font-semibold cursor-pointer" 
        onClick={() => navigate(user ? "/dashboard" : "/")}
      >
        Quizio
      </h1>
      <div className="flex items-center gap-4">
        {user && user.picture && (
          <img 
            src={user.picture} 
            alt={user.name} 
            className="w-10 h-10 rounded-full border border-gray-700"
            referrerPolicy="no-referrer" // Prevent browser block on Google profile images
          />
        )}
        <button
          className="text-xl px-7 py-2 cursor-pointer hover:bg-white text-white font-Lato hover:text-black rounded-xl border border-gray-700"
          onClick={handleClick}
        >
          {user ? "Sign Out" : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Header;
