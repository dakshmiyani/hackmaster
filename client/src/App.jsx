import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserPage from "./pages/UserPage";
import Mentor from "./pages/Mentor";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/team-leader" element={<UserPage />} />
        <Route path="/mentor" element={<Mentor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;