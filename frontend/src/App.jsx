import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ToastProvider } from "./context/ToastContext";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Quiz from "./pages/Quiz";
import Tutor from "./pages/Tutor";
import StudyPlanner from "./pages/StudyPlanner";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>

          {/* AUTH ROUTES (NO LAYOUT) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* APP ROUTES (WITH LAYOUT) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/tutor" element={<Tutor />} />
            <Route path="/study-planner" element={<StudyPlanner />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
