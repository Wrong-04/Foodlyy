import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import Layout from "../components/layout/Layout";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

// Customer pages
import HomePage from "../pages/customer/HomePage";
import MenuPage from "../pages/customer/MenuPage";
import CartPage from "../pages/customer/CartPage";
import CheckoutPage from "../pages/customer/CheckoutPage";
import FoodDetailPage from "../pages/customer/FoodDetailPage";
import ProfilePage from "../pages/customer/ProfilePage";
import OrderHistoryPage from "../pages/customer/OrderHistoryPage";
import OrderDetailPage from "../pages/customer/OrderDetailPage";
import BookingPage from "../pages/customer/BookingPage";
import BookingHistoryPage from "../pages/customer/BookingHistoryPage";
import BookingDetailPage from "../pages/customer/BookingDetailPage";

// Admin pages
import AdminPage from "../pages/admin/AdminPage";
import { useApp } from "../context/AppContext";

// Helper: bọc page trong Layout + ProtectedRoute
const PrivatePage = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: ("customer" | "admin")[];
}) => (
  <ProtectedRoute allowedRoles={roles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  const { currentUser, logout } = useApp();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Customer routes (cần đăng nhập) */}
      <Route path="/" element={<PrivatePage><HomePage /></PrivatePage>} />
      <Route path="/menu" element={<PrivatePage><MenuPage /></PrivatePage>} />
      <Route path="/cart" element={<PrivatePage><CartPage /></PrivatePage>} />
      <Route path="/dish/:dishId" element={<PrivatePage><FoodDetailPage /></PrivatePage>} />

      {/* Customer-only routes */}
      <Route path="/checkout" element={<PrivatePage roles={["customer"]}><CheckoutPage /></PrivatePage>} />
      <Route path="/orders" element={<PrivatePage roles={["customer"]}><OrderHistoryPage /></PrivatePage>} />
      <Route path="/booking" element={<PrivatePage roles={["customer"]}><BookingPage /></PrivatePage>} />
      <Route path="/book-table" element={<PrivatePage roles={["customer"]}><BookingPage /></PrivatePage>} />
      <Route path="/bookings" element={<PrivatePage roles={["customer"]}><BookingHistoryPage /></PrivatePage>} />

      {/* Shared routes (customer & admin) */}
      <Route path="/profile" element={<PrivatePage roles={["customer", "admin"]}><ProfilePage /></PrivatePage>} />
      <Route path="/orders/:orderId" element={<PrivatePage roles={["customer", "admin"]}><OrderDetailPage /></PrivatePage>} />
      <Route path="/bookings/:bookingId" element={<PrivatePage roles={["customer", "admin"]}><BookingDetailPage /></PrivatePage>} />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPage user={currentUser!} onLogout={logout} />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
