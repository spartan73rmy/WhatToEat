import { Trash2, ChefHat } from "lucide-react";

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

export default function FavoriteCard({ dish, onRemove }: FavoriteCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-medium">{dish.dish_name}</h3>
          {dish.cuisine && (
            <span className="text-xs text-gray-400">{dish.cuisine}</span>
          )}
        </div>
        <button
          onClick={() => onRemove(dish.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Quitar de favoritos"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex gap-3 text-xs text-gray-500 mb-2">
        {dish.calories && <span>🔥 {dish.calories} kcal</span>}
        {dish.protein_g && <span>P: {dish.protein_g}g</span>}
        {dish.carbs_g && <span>C: {dish.carbs_g}g</span>}
        {dish.fiber_g && <span>F: {dish.fiber_g}g</span>}
      </div>

      {dish.meal_type && (
        <span className="inline-block text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
          {dish.meal_type}
        </span>
      )}

      {dish.recipe_steps && dish.recipe_steps.length > 0 && (
        <div className="mt-3 pt-2 border-t">
          <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
            <ChefHat size={12} /> Preparación:
          </p>
          <ol className="list-decimal list-inside text-xs text-gray-600 space-y-0.5">
            {dish.recipe_steps.slice(0, 3).map((step, i) => (
              <li key={i} className="truncate">{step}</li>
            ))}
            {dish.recipe_steps.length > 3 && (
              <li className="text-gray-400">...{dish.recipe_steps.length - 3} pasos más</li>
            )}
          </ol>
        </div>
      )}
    </div>
  );
}
