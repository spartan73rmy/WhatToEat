import { useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteCard from "../components/favorites/FavoriteCard";

const mealTypes = [
  { value: "", label: "Todas" },
  { value: "desayuno", label: `🌅 Desayuno` },
  { value: "almuerzo", label: `🥪 Almuerzo` },
  { value: "comida", label: `🍽️ Comida` },
  { value: "merienda", label: `🍪 Merienda` },
  { value: "cena", label: `🌙 Cena` },
];

export default function FavoritesPage() {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? (favorites || []).filter((d: any) => d.meal_type === filter)
    : favorites || [];

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold mb-4">Favoritos</h1>

      {!isLoading && favorites && favorites.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {mealTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
                filter === t.value
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando favoritos...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">
            {filter ? "No hay favoritos de este tipo" : "No tienes platillos guardados como favoritos"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Explora platillos y guárdalos con el ícono ❤
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((dish: any) => (
            <FavoriteCard key={dish.id} dish={dish} onRemove={removeFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
