import { useState } from "react";
import MealCard from "./MealCard";

interface WeeklyGridProps {
  meals: any[];
  dayIndex: number;
  onSwap: (dayIndex: number, mealType: string) => void;
  onRate: (mealId: number, rating: number) => void;
  onEdit: (meal: any) => void;
}

const dayLabels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const mealOrder = ["desayuno", "almuerzo", "comida", "merienda", "cena"];

export default function WeeklyGrid({ meals, dayIndex, onSwap, onRate }: WeeklyGridProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const dayMeals = meals.filter((m: any) => m.day_index === dayIndex);
  const snacks = dayMeals.filter((m: any) => m.is_snack);
  const regular = dayMeals.filter((m: any) => !m.is_snack);

  const sorted = [...mealOrder].map(
    (type) => regular.find((m: any) => m.meal_type === type)
  ).filter(Boolean);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{dayLabels[dayIndex]}</h3>
      <div className="space-y-2">
        {sorted.map((meal: any) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onSwap={onSwap}
            onRate={onRate}
            expanded={expanded === meal.id}
            onToggle={() => setExpanded(expanded === meal.id ? null : meal.id)}
          />
        ))}
        {snacks.length > 0 && (
          <div className="mt-3 pt-2 border-t">
            <p className="text-xs text-gray-400 mb-1">🥜 Snacks</p>
            <div className="flex flex-wrap gap-2">
              {snacks.map((s: any) => (
                <span key={s.id} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                  {s.dish_name} ({s.calories} kcal)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
