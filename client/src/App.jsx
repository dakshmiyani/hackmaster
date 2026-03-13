import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserPage from "./pages/UserPage";
import { Toaster } from "react-hot-toast";
import Mentor from "./pages/Mentor";
import Login from "./pages/Login";
import CallPage from "./pages/CallPage";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;