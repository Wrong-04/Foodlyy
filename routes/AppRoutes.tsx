import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

// Pages
import LoginPage from "../page/LoginPage";
import RegisterPage from "../page/RegisterPage";
import ForgotPasswordPage from "../page/ForgotPasswordPage";
import HomePage from "../page/HomePage";
import MenuPage from "../page/MenuPage";
import CartPage from "../page/CartPage";
import CheckoutPage from "../page/CheckoutPage";
import FoodDetailPage from "../page/FoodDetailPage";
import ProfilePage from "../page/ProfilePage";
import OrderHistoryPage from "../page/OrderHistoryPage";
import OrderDetailPage from "../page/OrderDetailPage";
import BookingPage from "../page/BookingPage";
import BookingHistoryPage from "../page/BookingHistoryPage";
import BookingDetailPage from "../page/BookingDetailPage";
import AdminPage from "../page/AdminPage";
import { useApp } from "../context/AppContext";

// Helper: bọc một page trong Layout + ProtectedRoute
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
