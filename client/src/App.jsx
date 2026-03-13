import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserPage from "./pages/UserPage";
import { Toaster } from "react-hot-toast";
import Mentor from "./pages/Mentor";
import Login from "./pages/Login";
import CallPage from "./pages/CallPage";
import AdminPage from "./pages/AdminPage";
import JudgePage from "./pages/JudgePage";
import VolunteerPage from "./pages/VolunteerPage";
import LeaderboardSelection from "./components/dashboard/LeaderboardSelection";
import LeaderboardView from "./components/dashboard/LeaderboardView";
import RegisterTeam from "./components/dashboard/RegisterTeam";
import GithubAnalyticsDashboard from "./components/user/GithubAnalyticsDashboard";
import "./App.css";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            backgroundColor: "#111",
            color: "white",
            border: "1px solid rgba(220, 38, 38, 0.4)",
          },
        }}
      />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/team-leader" element={<UserPage />} />
          <Route path="/mentor" element={<Mentor />} />
          <Route path="/judge" element={<JudgePage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/call/:roomId" element={<CallPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/leaderboard-selection" element={<LeaderboardSelection />} />
          <Route path="/admin/leaderboard" element={<LeaderboardView />} />
          <Route path="/admin/leaderboard/:hackathonId" element={<LeaderboardView />} />
          <Route path="/admin/register" element={<RegisterTeam />} />
          <Route path="/admin/github-analytics" element={<GithubAnalyticsDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;