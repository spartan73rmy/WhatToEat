import { ReactNode } from "react";
import Navbar from "./Navbar";
import CinnamonRoll from "./CinnamonRoll";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <CinnamonRoll />
    </div>
  );
}
