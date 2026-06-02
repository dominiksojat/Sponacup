import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./store/useStore";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import PredictionsPage from "./pages/PredictionsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import RulesPage from "./pages/RulesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

function RequireAuth({ children }) {
  const { user, authLoading } = useStore();
  if (authLoading) return <div className="loader">⚽ Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}
function RequireAdmin({ children }) {
  const { user, authLoading } = useStore();
  if (authLoading) return <div className="loader">⚽ Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const init = useStore(s => s.init);
  useEffect(() => { init(); }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />
          <Route path="predictions" element={<PredictionsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
