import { useState } from "react";
import { Menu, X, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/THE PETERS LOGO.png";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  console.log(user, isAuthenticated)

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "User";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="fixed w-full z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="The Peters Agriculture" className="h-12" />
            <div>
              <div className="text-xl font-bold text-gray-900">THE PETERS</div>
              <div className="text-sm text-orange-600 font-semibold">
                Agriculture
              </div>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex space-x-8">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <a href="#about" className="nav-link">
              About
            </a>
            <a href="#services" className="nav-link">
              Services
            </a>
            <Link to="/courses" className="nav-link">
              Courses
            </Link>
            <a href="#contact" className="nav-link">
              Contact
            </a>
          </div>

          {/* AUTH ACTIONS (DESKTOP) */}
          <div className="hidden lg:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium shadow-lg"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 cursor-pointer">
                  <UserCircle size={32} className="text-emerald-700" />
                  <span className="font-medium">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-xl">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="mobile-link">
              Home
            </Link>
            <a href="#about" className="mobile-link">
              About
            </a>
            <a href="#services" className="mobile-link">
              Services
            </a>
            <Link to="/courses" className="mobile-link">
              Courses
            </Link>
            <a href="#contact" className="mobile-link">
              Contact
            </a>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="block text-center w-full px-4 py-3 text-emerald-600 border-2 border-emerald-600 rounded-lg font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 py-2">
                  <UserCircle size={28} />
                  <span>{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-red-100 text-red-600 rounded-lg font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
