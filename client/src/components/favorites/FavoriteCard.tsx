import { useState } from "react";
import { Trash2, ChefHat, ChevronDown, ChevronUp } from "lucide-react";

interface FavoriteCardProps {
  dish: {
    id: number;
    dish_name: string;
    cuisine?: string;
    meal_type?: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fiber_g?: number;
    ingredients?: { name: string; amount: number; unit: string }[];
    recipe_steps?: string[];
  };
  onRemove: (id: number) => void;
}

const mealIcons: Record<string, string> = {
  desayuno: "🌅",
  almuerzo: "🥪",
  comida: "🍽️",
  merienda: "🍪",
  cena: "🌙",
};

export default function FavoriteCard({ dish, onRemove }: FavoriteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const steps = dish.recipe_steps || [];
  const hasMore = steps.length > 3;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm sm:text-base break-words">{dish.dish_name}</h3>
          {dish.cuisine && (
            <span className="text-xs text-gray-400">{dish.cuisine}</span>
          )}
        </div>
        <button
          onClick={() => onRemove(dish.id)}
          className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Quitar de favoritos"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
        {dish.calories && <span>🔥 {dish.calories} kcal</span>}
        {dish.protein_g && <span>P: {dish.protein_g}g</span>}
        {dish.carbs_g && <span>C: {dish.carbs_g}g</span>}
        {dish.fiber_g && <span>F: {dish.fiber_g}g</span>}
      </div>

      {dish.meal_type && (
        <span className="inline-block text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
          {mealIcons[dish.meal_type] || ""} {dish.meal_type}
        </span>
      )}

      {dish.recipe_steps && dish.recipe_steps.length > 0 && (
        <div className="mt-3 pt-2 border-t">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <ChefHat size={12} /> Preparación:
            </p>
            <button className="text-gray-400 hover:text-gray-600">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          <ol className="list-decimal list-inside text-xs text-gray-600 space-y-0.5 mt-1">
            {(expanded || !hasMore ? steps : steps.slice(0, 3)).map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
            {!expanded && hasMore && (
              <li className="text-gray-400 cursor-pointer" onClick={() => setExpanded(true)}>
                ...{steps.length - 3} pasos más
              </li>
            )}
          </ol>
        </div>
      )}
    </div>
  );
}
