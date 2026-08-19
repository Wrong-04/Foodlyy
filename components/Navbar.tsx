import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UtensilsCrossed, ShoppingCart, Menu, X, User as UserIcon, LogOut, FileText, Settings, Calendar } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  cartCount?: number;
  currentUser?: User | null;
  onLogout?: () => void;
}

const Navbar = ({ cartCount = 0, currentUser = null, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const links = [
    { label: "Home", path: "/" },
    { label: "Menu", path: "/menu" },
    { label: "Đặt bàn", path: "/book-table" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle clicking outside the profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setProfileDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="bg-primary p-1.5 rounded-lg">
            <UtensilsCrossed className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-textMain tracking-tight">
            Food<span className="text-primary">ly</span>
          </span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Cart Button (icon + text) */}
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all bg-primary/10 text-primary hover:bg-primary/20"
          >
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* User Profile or Login Button */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <UserIcon size={20} className="fill-current" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition-colors"
                    >
                      <Settings size={16} />
                      Thông tin
                    </button>
                    <button
                      onClick={() => {
                        navigate("/bookings");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition-colors"
                    >
                      <Calendar size={16} />
                      Lịch sử đặt bàn
                    </button>
                    <button
                      onClick={() => {
                        navigate("/orders");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition-colors"
                    >
                      <FileText size={16} />
                      Lịch sử đơn hàng
                    </button>
                  </div>

                  <div className="py-1 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:flex items-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primaryDark transition-all shadow-sm shadow-primary/20"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-1">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${isActive(link.path)
                ? "bg-primary/10 text-primary"
                : "text-textSec hover:bg-gray-50"
                }`}
            >
              {link.label}
            </button>
          ))}

          {currentUser ? (
            <div className="border-t border-gray-100 mt-2 pt-2 space-y-1">
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings size={18} />
                Thông tin
              </button>
              <button
                onClick={() => {
                  navigate("/bookings");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Calendar size={18} />
                Lịch sử đặt bàn
              </button>
              <button
                onClick={() => {
                  navigate("/orders");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FileText size={18} />
                Lịch sử đơn hàng
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
