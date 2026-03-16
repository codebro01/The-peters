import { useState, useEffect } from "react";
import { Menu, X, UserCircle, ShoppingBag } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/THE PETERS LOGO.png";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../contexts/CartContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "User";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${
          scrolled 
            ? "bg-black/90 backdrop-blur-md py-3 shadow-2xl border-b border-white/10" 
            : "bg-gradient-to-b from-black/80 to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            {/* LOGO */}
            <Link to="/" className="flex items-center space-x-3 group outline-none">
              <div className="relative">
                <img src={logo} alt="The Peters" className="h-10 md:h-12 transform group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-black text-white tracking-tighter leading-none">THE PETERS</div>
                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] leading-none mt-1">
                  Agriculture
                </div>
              </div>
            </Link>

            {/* DESKTOP LINKS */}
            <div className="hidden lg:flex items-center space-x-8">
              {[
                { name: "Home", path: "/" },
                { name: "About", path: "/#about", isHash: true },
                { name: "Services", path: "/#services", isHash: true },
                { name: "Courses", path: "/courses" },
                { name: "Contact", path: "/#contact", isHash: true },
                { name: "Store", path: "/store" }
              ].map((item) => (
                item.isHash ? (
                   <a
                    key={item.name}
                    href={item.path}
                    className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300 group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300 group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link to="/checkout" className="relative p-2 text-gray-300 hover:text-white transition-all hover:scale-110">
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="hidden lg:flex items-center space-x-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="text-sm font-semibold text-white hover:text-emerald-400 transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                      <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/50 transition-all">
                        {userName[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-200 group-hover:text-white transition">{userName}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-red-400 transition transform hover:rotate-90 duration-300"
                      title="Logout"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* MOBILE MENU TOGGLE */}
              <button
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* MOBILE DRAWER */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-[70] w-[85%] max-w-[320px] bg-black border-l border-white/10 shadow-2xl transition-transform duration-500 ease-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-8 pt-6">
          <div className="flex justify-between items-center mb-10">
            <img src={logo} alt="Logo" className="h-10" />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          <nav className="flex flex-col space-y-4">
            {[
              { name: "Home", path: "/" },
              { name: "About", path: "/#about", isHash: true },
              { name: "Services", path: "/#services", isHash: true },
              { name: "Courses", path: "/courses" },
              { name: "Contact", path: "/#contact", isHash: true },
              { name: "Store", path: "/store" }
            ].map((item, idx) => (
              item.isHash ? (
                <a
                  key={item.name}
                  href={item.path}
                  className={`text-2xl font-black tracking-tight transition-all duration-500 ${
                    mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${idx * 75}ms` }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-400 hover:text-white transition-colors">{item.name}</span>
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-2xl font-black tracking-tight transition-all duration-500 ${
                    mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${idx * 75}ms` }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-400 hover:text-white transition-colors">{item.name}</span>
                </Link>
              )
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/10">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="block text-center w-full py-4 text-white font-bold text-lg border border-white/20 rounded-2xl active:bg-white/10 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center w-full py-4 bg-emerald-600 text-white font-bold text-lg rounded-2xl active:bg-emerald-700 transition shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl" onClick={() => navigate('/dashboard')}>
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-emerald-500/20">
                    {userName[0]}
                  </div>
                  <div>
                    <div className="text-white font-bold leading-none mb-1">{userName}</div>
                    <div className="text-gray-500 text-xs truncate max-w-[150px]">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-4 bg-red-500/10 text-red-500 font-bold rounded-2xl active:bg-red-500/20 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
