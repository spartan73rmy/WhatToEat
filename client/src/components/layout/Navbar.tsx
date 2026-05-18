import { NavLink } from "react-router-dom";
import { Settings, ClipboardList, Search, Heart } from "lucide-react";

const links = [
  { to: "/", label: "Config", icon: Settings },
  { to: "/menus", label: "Menús", icon: ClipboardList },
  { to: "/explore", label: "Explorar", icon: Search },
  { to: "/favorites", label: "Favoritos", icon: Heart },
];

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 sm:gap-3 lg:gap-6 h-14">
        <span className="font-bold text-lg text-amber-600 whitespace-nowrap">WhatToEat</span>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive ? "text-amber-600" : "text-gray-600 hover:text-gray-900"
              }`
            }
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
