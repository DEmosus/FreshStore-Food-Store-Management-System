import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Layout.css";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/entries", label: "Entries" },
  { to: "/add-entry", label: "+ Add entry" },
  { to: "/reports", label: "Reports" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="layout-root">
      <header className="layout-header">
        {/* Logo */}
        <div className="layout-logo">
          <div className="layout-logo-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 12c0-2.5 2-4 6-4s6 1.5 6 4"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="M8 3L4 7h8L8 3z" fill="#fff" opacity="0.7" />
            </svg>
          </div>
          <span className="layout-logo-name">FreshStore</span>
        </div>

        {/* Nav */}
        <nav className="layout-nav">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `layout-nav-link${isActive ? " active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="layout-user-menu">
          <span className="layout-user-name">{user?.name}</span>
          <div className="layout-avatar">{initials}</div>
          <button className="layout-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="layout-main">{children}</main>
    </div>
  );
}
