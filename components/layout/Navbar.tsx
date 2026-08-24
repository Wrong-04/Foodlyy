import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UtensilsCrossed, ShoppingCart, Menu, X,
  User as UserIcon, LogOut, FileText, Settings, Calendar,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const NAV_LINKS = [
  { label: "Trang chủ", path: "/" },
  { label: "Thực đơn", path: "/menu" },
  { label: "Đặt bàn", path: "/book-table" },
];

const Navbar = () => {
  const { cartCount, currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="bg-primary p-1.5 rounded-lg">
            <UtensilsCrossed className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-textMain tracking-tight">
            Food<span className="text-primary">ly</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all bg-primary/10 text-primary hover:bg-primary/20"
          >
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* User / Login */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <UserIcon size={20} className="fill-current" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    {[
                      { icon: Settings, label: "Thông tin", path: "/profile" },
                      { icon: Calendar, label: "Lịch sử đặt bàn", path: "/bookings" },
                      { icon: FileText, label: "Lịch sử đơn hàng", path: "/orders" },
                    ].map(({ icon: Icon, label, path }) => (
                      <button
                        key={path}
                        onClick={() => { navigate(path); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition-colors"
                      >
                        <Icon size={16} /> {label}
                      </button>
                    ))}
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} /> Đăng xuất
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
              Đăng nhập
            </button>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); setMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                isActive(link.path) ? "bg-primary/10 text-primary" : "text-textSec hover:bg-gray-50"
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
              {[
                { icon: Settings, label: "Thông tin", path: "/profile" },
                { icon: Calendar, label: "Lịch sử đặt bàn", path: "/bookings" },
                { icon: FileText, label: "Lịch sử đơn hàng", path: "/orders" },
              ].map(({ icon: Icon, label, path }) => (
                <button
                  key={path}
                  onClick={() => { navigate(path); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Icon size={18} /> {label}
                </button>
              ))}
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => { navigate("/login"); setMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm"
            >
              Đăng nhập
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
