import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { User } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User["role"][];
}

// Kiểm tra quyền truy cập và chuyển hướng nếu cần
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { currentUser } = useApp();

  // Chưa đăng nhập mà route yêu cầu quyền cụ thể
  if (!currentUser && allowedRoles) {
    return <Navigate to="/login" replace />;
  }

  // Sai role
  if (currentUser && allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const target = currentUser.role === "admin" ? "/admin" : "/";
    return <Navigate to={target} replace />;
  }

  // Admin không được vào trang của customer
  if (currentUser?.role === "admin" && !allowedRoles?.includes("admin")) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
