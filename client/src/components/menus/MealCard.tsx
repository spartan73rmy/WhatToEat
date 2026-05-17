import { ChefHat, RotateCcw } from "lucide-react";
import RatingStars from "./RatingStars";

interface MealCardProps {
  meal: {
    id: number;
    day_index: number;
    meal_type: string;
    is_snack?: boolean;
    dish_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fiber_g: number;
    user_rating: number | null;
    ingredients?: { name: string; amount: number; unit: string }[];
    recipe_steps?: string[];
  };
  onSwap: (dayIndex: number, mealType: string) => void;
  onRate?: (mealId: number, rating: number) => void;
  expanded: boolean;
  onToggle: () => void;
}

const mealColors: Record<string, string> = {
  desayuno: "border-l-amber-400",
  almuerzo: "border-l-orange-400",
  comida: "border-l-red-400",
  merienda: "border-l-purple-400",
  cena: "border-l-blue-400",
};

export default function MealCard({ meal, onSwap, onRate, expanded, onToggle }: MealCardProps) {
  const colorClass = mealColors[meal.meal_type] || "border-l-gray-400";

  return (
    <div
      className={`bg-white rounded-lg border border-l-4 ${colorClass} shadow-sm overflow-hidden`}
    >
      <div className="p-3 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
              {meal.is_snack ? "🥜 Snack" : meal.meal_type}
            </p>
            <p className="font-medium text-sm truncate">{meal.dish_name}</p>
          </div>
          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap ml-2">
            {meal.calories} kcal
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <RatingStars rating={meal.user_rating} onChange={(r) => onRate?.(meal.id, r)} readonly={!onRate} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwap(meal.day_index, meal.meal_type);
            }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 transition-colors"
            title="Reemplazar comida"
          >
            <RotateCcw size={12} />
            Swap
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t pt-2 space-y-2 text-xs text-gray-600">
          <div className="flex gap-3">
            <span>P: {meal.protein_g}g</span>
            <span>C: {meal.carbs_g}g</span>
            <span>F: {meal.fiber_g}g</span>
          </div>
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                <ChefHat size={12} /> Ingredientes:
              </p>
              <ul className="list-disc list-inside">
                {meal.ingredients.map((ing, i) => (
                  <li key={i}>{ing.name} — {ing.amount}{ing.unit}</li>
                ))}
              </ul>
            </div>
          )}
          {meal.recipe_steps && meal.recipe_steps.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">📖 Preparación:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                {meal.recipe_steps.map((step, i) => (
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
