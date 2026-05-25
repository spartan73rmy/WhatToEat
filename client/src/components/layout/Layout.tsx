import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import CinnamonRoll from "./CinnamonRoll";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>
      <CinnamonRoll />
    </div>
  );
}
