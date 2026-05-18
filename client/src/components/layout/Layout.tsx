import { useState, useEffect, ReactNode } from "react";
import Navbar from "./Navbar";
import CinnamonRoll from "./CinnamonRoll";
import CreateMenuModal from "../menus/CreateMenuModal";
import { aiApi } from "../../api/configApi";

export default function Layout({ children }: { children: ReactNode }) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useEffect(() => {
    aiApi.warmup();
  }, []);

  useEffect(() => {
    const handler = () => setShowCreateMenu(true);
    window.addEventListener("open-create-menu", handler);
    return () => window.removeEventListener("open-create-menu", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <CinnamonRoll onClick={() => setShowCreateMenu(true)} />
      <CreateMenuModal open={showCreateMenu} onClose={() => setShowCreateMenu(false)} />
    </div>
  );
}
