import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useMenu } from "../hooks/useMenus";
import { menuApi } from "../api/configApi";
import WeeklyGrid from "../components/menus/WeeklyGrid";
import SwapModal from "../components/menus/SwapModal";
import EditMealModal from "../components/menus/EditMealModal";

export default function MenuDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const menuId = parseInt(id || "0");
  const { data: menu, isLoading } = useMenu(menuId);
  const [dayIndex, setDayIndex] = useState(0);
  const [swapMeal, setSwapMeal] = useState<{ dayIndex: number; mealType: string } | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [editMeal, setEditMeal] = useState<any>(null);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Cargando menú...</div>;
  }

  if (!menu) {
    return <div className="text-center py-12 text-gray-400">Menú no encontrado</div>;
  }

  const dayLabels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const meals = menu.meals || [];
  const currentSwapMeal = swapMeal
    ? meals.find(
        (m: any) =>
          m.day_index === swapMeal.dayIndex && m.meal_type === swapMeal.mealType
      )
    : null;

  const handleRate = async (mealId: number, rating: number) => {
    try {
      await menuApi.rateMeal(menuId, mealId, rating);
      queryClient.invalidateQueries({ queryKey: ["menu", menuId] });
    } catch (err) {
      console.error("Error rating meal:", err);
    }
  };

  const handleSwap = async (params: { preferredIngredients?: string; cravings?: string; avoidIngredients?: string }) => {
    if (!swapMeal) return;
    setSwapping(true);
    try {
      await menuApi.swapMeal(menuId, { ...swapMeal, ...params });
      queryClient.invalidateQueries({ queryKey: ["menu", menuId] });
    } catch (err) {
      console.error("Error swapping meal:", err);
    } finally {
      setSwapping(false);
      setSwapMeal(null);
    }
  };

  const handleDelete = async () => {
    await menuApi.delete(menuId);
    queryClient.invalidateQueries({ queryKey: ["menus"] });
    navigate("/menus");
  };

  const handleEditMeal = async (mealId: number, data: Record<string, unknown>) => {
    try {
      await fetch(`/api/menus/${menuId}/meals/${mealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      queryClient.invalidateQueries({ queryKey: ["menu", menuId] });
    } catch (err) {
      console.error("Error editing meal:", err);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/menus")} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold flex-1">{menu.name}</h1>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {dayLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => setDayIndex(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              dayIndex === i
                ? "bg-amber-600 text-white"
                : "bg-white border text-gray-600 hover:border-amber-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <WeeklyGrid
        meals={meals}
        dayIndex={dayIndex}
        onSwap={(di, mt) => setSwapMeal({ dayIndex: di, mealType: mt })}
        onRate={handleRate}
        onEdit={(meal) => setEditMeal(meal)}
      />

      <SwapModal
        open={!!swapMeal}
        onClose={() => setSwapMeal(null)}
        currentDish={currentSwapMeal?.dish_name || ""}
        mealType={swapMeal?.mealType || ""}
        dayLabel={dayLabels[swapMeal?.dayIndex || 0]}
        onSwap={handleSwap}
        swapping={swapping}
      />

      <EditMealModal
        open={!!editMeal}
        onClose={() => setEditMeal(null)}
        meal={editMeal}
        onSave={handleEditMeal}
      />
    </div>
  );
}
