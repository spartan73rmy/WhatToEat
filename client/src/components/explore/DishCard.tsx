import { useState } from "react";
import { Heart, Plus, ChefHat, ChevronDown, ChevronUp } from "lucide-react";

interface DishCardProps {
  dish: {
    dish_name: string;
    meal_type: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fiber_g: number;
    difficulty?: string;
    portions?: string;
    ingredients?: { name: string; amount: number; unit: string }[];
    recipe_steps?: string[];
  };
  onAdd?: () => void;
  onFavorite?: () => void;
  favorited?: boolean;
}

const difficultyColors: Record<string, string> = {
  facil: "bg-green-100 text-green-700",
  media: "bg-amber-100 text-amber-700",
  dificil: "bg-red-100 text-red-700",
};

export default function DishCard({ dish, onAdd, onFavorite, favorited }: DishCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm flex-1">{dish.dish_name}</h3>
          <span className="text-xs font-semibold text-amber-700 whitespace-nowrap ml-2">
            {dish.calories} kcal
          </span>
        </div>
        <div className="flex gap-2 text-xs text-gray-500 mb-2">
          <span>P: {dish.protein_g}g</span>
          <span>C: {dish.carbs_g}g</span>
          <span>F: {dish.fiber_g}g</span>
        </div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <span className="inline-block text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
            {dish.meal_type}
          </span>
          {dish.difficulty && (
            <span className={`inline-block text-xs px-2 py-0.5 rounded ${difficultyColors[dish.difficulty] || "bg-gray-100"}`}>
              {dish.difficulty}
            </span>
          )}
          {dish.portions && (
            <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {dish.portions}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Plus size={14} /> Agregar
            </button>
          )}
          {onFavorite && (
            <button
              onClick={onFavorite}
              className={`flex items-center justify-center p-1.5 text-xs rounded-lg transition-colors ${
                favorited ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              }`}
              title="Guardar como favorito"
            >
              <Heart size={16} fill={favorited ? "currentColor" : "none"} />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center p-1.5 text-xs text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title={expanded ? "Ocultar receta" : "Ver receta"}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t pt-3 space-y-3 text-xs text-gray-600">
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                <ChefHat size={12} /> Ingredientes:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {dish.ingredients.map((ing, i) => (
                  <li key={i}>{ing.name} — {ing.amount}{ing.unit}</li>
                ))}
              </ul>
            </div>
          )}
          {dish.recipe_steps && dish.recipe_steps.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">📖 Preparación:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                {dish.recipe_steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}