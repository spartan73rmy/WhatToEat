import { NavLink } from "react-router-dom";
import { Settings, ClipboardList, Compass, Heart } from "lucide-react";

const links = [
  { to: "/", label: "Config", icon: Settings },
  { to: "/menus", label: "Menús", icon: ClipboardList },
  { to: "/explore", label: "Explorar", icon: Compass },
  { to: "/favorites", label: "Favoritos", icon: Heart },
];

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="text-xl font-bold text-primary-600">WhatToEat</span>
        <div className="flex gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-100 text-primary-700"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
