import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./AdminOrders";
import AdminBookingPage from "./AdminBookingPage";
import AdminMenu from "./AdminMenu";
import AdminUsers from "./AdminUsers";
import AdminTables from "./AdminTables";



const AdminPage = ({ user, onLogout }) => (
  <AdminLayout user={user} onLogout={onLogout}>
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="bookings" element={<AdminBookingPage />} />
      <Route path="menu" element={<AdminMenu />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="tables" element={<AdminTables />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  </AdminLayout>
);

export default AdminPage;
