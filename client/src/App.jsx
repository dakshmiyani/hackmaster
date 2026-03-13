import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserPage from "./pages/UserPage";
import Mentor from "./pages/Mentor";
import CallPage from "./pages/CallPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* /team-leader/:teamId */}
        <Route path="/team-leader" element={<UserPage />} />
        <Route path="/mentor" element={<Mentor />} />
        <Route path="/call/:roomId" element={<CallPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;