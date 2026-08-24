import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Layout bọc Navbar + nội dung + Footer
const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

export default Layout;
