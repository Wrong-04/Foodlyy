import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { User } from "../types";
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminOrders from "./admin/AdminOrders";
import AdminBookingPage from "./admin/AdminBookingPage";
import AdminMenu from "./admin/AdminMenu";
import AdminUsers from "./admin/AdminUsers";

interface AdminPageProps {
  user: User;
  onLogout: () => void;
}

const AdminPage = ({ user, onLogout }: AdminPageProps) => (
  <AdminLayout user={user} onLogout={onLogout}>
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="bookings" element={<AdminBookingPage />} />
      <Route path="menu" element={<AdminMenu />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  </AdminLayout>
);

export default AdminPage;
