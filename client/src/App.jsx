import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserPage from "./pages/UserPage";
import { Toaster } from "react-hot-toast";
import Mentor from "./pages/Mentor";
import Login from "./pages/Login";
import CallPage from "./pages/CallPage";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import AdminPage from "./pages/AdminPage";
import LeaderboardSelection from "../src/components/dashboard/LeaderboardSelection";
import LeaderboardView from "../src/components/dashboard/LeaderboardView";
import RegisterTeam from "../src/components/dashboard/RegisterTeam";
import GithubAnalyticsDashboard from "./components/user/GithubAnalyticsDashboard";

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            backgroundColor: "#1c1c1c",
            color: "white",
            border: "1px solid #aaaaaa",
          },
        }}
      />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/team-leader" element={<UserPage />} />
          <Route path="/mentor" element={<Mentor />} />
          <Route path="/call/:roomId" element={<CallPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/leaderboard-selection" element={<LeaderboardSelection />} />
          <Route path="/admin/leaderboard" element={<LeaderboardView />} />
          <Route path="/admin/leaderboard/:hackathonId" element={<LeaderboardView />} />
          <Route path="/admin/register" element={<RegisterTeam />} />
          <Route path="/github-analytics-dashboard" element={<GithubAnalyticsDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;