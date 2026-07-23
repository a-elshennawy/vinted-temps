import { Outlet } from "react-router-dom";
import "./Layout.css";
import Navbar from "./Navbar";

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default Layout;
