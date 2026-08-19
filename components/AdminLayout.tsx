import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  LogOut,
  ChefHat,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "../types";

type AdminTab = "dashboard" | "orders" | "menu" | "users" | "bookings";

const TAB_PATHS: Record<AdminTab, string> = {
  dashboard: "/admin",
  orders: "/admin/orders",
  bookings: "/admin/bookings",
  menu: "/admin/menu",
  users: "/admin/users",
};

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: AdminTab;
  setTab?: (tab: AdminTab) => void;
  user: User;
  onLogout: () => void;
}

const NAV_ITEMS: {
  id: AdminTab;
  label: string;
  icon: React.FC<{ size?: number }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Đơn hàng", icon: ShoppingCart },
  { id: "bookings", label: "Đặt bàn", icon: CalendarDays },
  { id: "menu", label: "Thực đơn", icon: UtensilsCrossed },
  { id: "users", label: "Người dùng", icon: Users },
];

const AdminLayout = ({ children, user, onLogout }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeTab =
    (Object.entries(TAB_PATHS) as [AdminTab, string][])
      .slice()
      .reverse()
      .find(
        ([, path]) => pathname === path || pathname.startsWith(path + "/"),
      )?.[0] ?? "dashboard";

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col shadow-sm sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ChefHat size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-extrabold text-textMain leading-none">
                Foodly
              </p>
              <p className="text-[10px] text-textSec font-medium">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-textMain leading-tight truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-primary font-semibold uppercase">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(TAB_PATHS[item.id])}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-textSec hover:bg-gray-100 hover:text-textMain"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.label}
                </div>
                {active && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
export type { AdminTab };
