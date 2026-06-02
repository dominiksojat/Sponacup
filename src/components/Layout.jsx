import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Trophy, Grid3X3, BarChart3, BookOpen, User, Settings, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { to:"/",           label:"Dashboard",   icon:Trophy,    end:true },
  { to:"/predictions",label:"Predictions", icon:Grid3X3        },
  { to:"/leaderboard",label:"Leaderboard", icon:BarChart3       },
  { to:"/rules",      label:"Rules",       icon:BookOpen        },
  { to:"/profile",    label:"My Stats",    icon:User            },
];

export default function Layout() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="shell">
      <nav className={`sidebar ${open ? "open" : ""}`}>
        <div className="sb-top">
          <span className="sb-logo">⚽ SponaCup</span>
          <button className="icon-btn mobile-only" onClick={() => setOpen(false)}><X size={20}/></button>
        </div>
        <ul className="nav-list">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} onClick={() => setOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <Icon size={18}/><span>{label}</span>
              </NavLink>
            </li>
          ))}
          {user?.role === "admin" && (
            <li>
              <NavLink to="/admin" onClick={() => setOpen(false)}
                className={({ isActive }) => `nav-link admin-link ${isActive ? "active" : ""}`}>
                <Settings size={18}/><span>Admin</span>
              </NavLink>
            </li>
          )}
        </ul>
        <div className="sb-foot">
          <div className="user-chip">
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-pts">{user?.points ?? 0} pts</span>
            </div>
          </div>
          <button className="icon-btn" onClick={handleLogout} title="Log out"><LogOut size={18}/></button>
        </div>
      </nav>
      <div className="topbar">
        <button className="icon-btn" onClick={() => setOpen(true)}><Menu size={22}/></button>
        <span className="topbar-logo">⚽ SponaCup</span>
        <span className="topbar-pts">{user?.points ?? 0} pts</span>
      </div>
      {open && <div className="overlay" onClick={() => setOpen(false)}/>}
      <main className="content"><Outlet /></main>
    </div>
  );
}
