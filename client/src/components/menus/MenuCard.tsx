import { CalendarDays, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const priceLabels: Record<string, string> = {
  barato: "💰 Barato",
  medio: "💰💰 Medio",
  caro: "💰💰💰 Caro",
  muy_caro: "💰💰💰💰 Muy caro",
};

const priceColors: Record<string, string> = {
  barato: "bg-green-100 text-green-700",
  medio: "bg-amber-100 text-amber-700",
  caro: "bg-orange-100 text-orange-700",
  muy_caro: "bg-red-100 text-red-700",
};

interface MenuCardProps {
  menu: {
    id: number;
    name: string;
    created_at: string;
    difficulty?: string;
    price_category?: string;
  };
  onDelete: (id: number) => void;
}

export default function MenuCard({ menu, onDelete }: MenuCardProps) {
  const navigate = useNavigate();
  const date = new Date(menu.created_at).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      onClick={() => navigate(`/menus/${menu.id}`)}
      className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{menu.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <CalendarDays size={14} />
            <span>{date}</span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {menu.difficulty && (
              <span className="inline-block text-xs bg-gray-100 px-2 py-0.5 rounded">
                {menu.difficulty}
              </span>
            )}
            {menu.price_category && (
              <span className={`inline-block text-xs px-2 py-0.5 rounded ${priceColors[menu.price_category] || "bg-gray-100"}`}>
                {priceLabels[menu.price_category] || menu.price_category}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(menu.id);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Eliminar menú"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
