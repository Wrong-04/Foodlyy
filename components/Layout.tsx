import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useApp } from "../context/AppContext";

// Layout bọc Navbar + nội dung + Footer, tự đọc state từ Context
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { cartCount, currentUser, logout } = useApp();

  return (
    <>
      <Navbar cartCount={cartCount} currentUser={currentUser} onLogout={logout} />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
