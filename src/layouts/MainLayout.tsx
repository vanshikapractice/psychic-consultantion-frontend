import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { Avatar } from "../components/ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectAuthUser, logout } from "../store";

const customerNavItems = [
  { to: "/", label: "Find a Psychic", icon: "🔮" },
  { to: "/bookings", label: "My Bookings", icon: "📅" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const psychicNavItems = [
  { to: "/psychic/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/bookings", label: "My Sessions", icon: "📅" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export function MainLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const location = useLocation();
  const isPsychic = user?.role === "psychic";
  const navItems = isPsychic ? psychicNavItems : customerNavItems;

  return (
    <div className="layout">
      <header className="header">
        <div className="container header__container">
          <Link to={isPsychic ? "/psychic/dashboard" : "/"} className="header__logo">
            🔮 PsychicConnect
          </Link>

          <nav className="header__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="header__nav-link"
                data-active={location.pathname === item.to}
              >
                <span className="header__nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__user">
            {user ? (
              <>
                <Avatar
                  src={user.profileImage}
                  alt={user.name}
                  name={user.name}
                  size="sm"
                />
                <span className="header__username">{user.name}</span>
                <button
                  type="button"
                  className="header__logout"
                  onClick={() => dispatch(logout())}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header__nav-link">
                  Login
                </Link>
                <Link to="/register" className="header__cta">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} PsychicConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
