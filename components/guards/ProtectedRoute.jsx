import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";



// Kiểm tra quyền truy cập và chuyển hướng nếu cần
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useApp();

  if (!currentUser && allowedRoles) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser && allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === "admin" ? "/admin" : "/"} replace />;
  }

  // Admin không được vào trang chỉ dành cho customer
  if (currentUser?.role === "admin" && !allowedRoles?.includes("admin")) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
