import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Home from "./components/Home";
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import QuizPage from './components/QuizPage ';
import ChallengeLobby from './components/ChallengeLobby';
import ChallengePlay from './components/ChallengePlay';

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
  return (
    <div className="bg-[#070916]">
      <AuthProvider>
        <RouterProvider router={appRoute} />
      </AuthProvider>
    </div>
  );
}

export default App;
