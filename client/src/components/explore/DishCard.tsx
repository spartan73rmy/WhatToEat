import { Heart, Plus } from "lucide-react";

interface DishCardProps {
  dish: {
    dish_name: string;
    meal_type: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  onAdd?: () => void;
  onFavorite?: () => void;
}

export default function DishCard({ dish, onAdd, onFavorite }: DishCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm flex-1">{dish.dish_name}</h3>
        <span className="text-xs font-semibold text-amber-700 whitespace-nowrap ml-2">
          {dish.calories} kcal
        </span>
      </div>
      <div className="flex gap-2 text-xs text-gray-500 mb-3">
        <span>P: {dish.protein_g}g</span>
        <span>C: {dish.carbs_g}g</span>
        <span>F: {dish.fiber_g}g</span>
      </div>
      <span className="inline-block text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 mb-3">
        {dish.meal_type}
      </span>
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
            className="flex items-center justify-center p-1.5 text-xs text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Guardar como favorito"
          >
            <Heart size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
