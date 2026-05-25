import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMenu, useSwapMeal, useRateMeal } from "../hooks/useMenus";
import { DAYS } from "../types";
import {
  ArrowLeft, RefreshCw, Star, ChevronDown, ChevronUp,
  Loader2, UtensilsCrossed,
} from "lucide-react";

export default function MenuDetailPage() {
  const { id } = useParams<{ id: string }>();
  const menuId = Number(id);
  const { data: menu, isLoading } = useMenu(menuId);
  const swapMeal = useSwapMeal(menuId);
  const rateMeal = useRateMeal(menuId);

  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [swapTarget, setSwapTarget] = useState<{
    dayIndex: number;
    mealType: string;
    currentDish: string;
  } | null>(null);
  const [swapIngredients, setSwapIngredients] = useState("");
  const [swapCravings, setSwapCravings] = useState("");
  const [swapAvoid, setSwapAvoid] = useState("");

  if (isLoading) return <p className="text-center py-20">Cargando...</p>;
  if (!menu) return <p className="text-center py-20">Menú no encontrado</p>;

  const getMeals = (dayIndex: number) =>
    menu.meals?.filter((m) => m.day_index === dayIndex && !m.is_snack) ?? [];
  const getSnacks = (dayIndex: number) =>
    menu.meals?.filter((m) => m.day_index === dayIndex && m.is_snack) ?? [];

  const mealTypes = [
    ...new Set(menu.meals?.filter((m) => !m.is_snack).map((m) => m.meal_type) ?? []),
  ];

  const handleSwap = async () => {
    if (!swapTarget) return;
    await swapMeal.mutateAsync({
      dayIndex: swapTarget.dayIndex,
      mealType: swapTarget.mealType,
      preferredIngredients: swapIngredients
        ? swapIngredients.split(",").map((s) => s.trim())
        : undefined,
      cravings: swapCravings || undefined,
      avoidIngredients: swapAvoid
        ? swapAvoid.split(",").map((s) => s.trim())
        : undefined,
    });
    setSwapTarget(null);
    setSwapIngredients("");
    setSwapCravings("");
    setSwapAvoid("");
  };

  const handleRate = (mealId: number, rating: number) => {
    rateMeal.mutate({ mealId, rating });
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/menus" className="text-stone-400 hover:text-stone-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800">{menu.name}</h1>
        </div>
        <span className="text-xs text-stone-400">
          Creado {new Date(menu.created_at).toLocaleDateString("es-MX")}
        </span>
      </div>

      {/* Weekly Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 text-stone-500 font-medium text-xs">Día</th>
              {mealTypes.map((mt) => (
                <th key={mt} className="p-2 text-stone-500 font-medium text-xs text-center capitalize">
                  {mt}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, di) => {
              const meals = getMeals(di);
              return (
                <tr key={di} className="border-t border-stone-100">
                  <td className="p-2 font-medium text-stone-700 text-sm whitespace-nowrap">{day}</td>
                  {mealTypes.map((mt) => {
                    const meal = meals.find((m) => m.meal_type === mt);
                    return (
                      <td key={mt} className="p-1.5 align-top">
                        {meal ? (
                          <div className="bg-white border border-stone-200 rounded-lg p-2.5 min-w-[140px]">
                            <div className="flex items-start justify-between gap-1">
                              <button
                                onClick={() =>
                                  setExpandedMeal(expandedMeal === meal.id ? null : meal.id)
                                }
                                className="text-left flex-1"
                              >
                                <span className="text-sm font-medium text-stone-800 block leading-tight">
                                  {meal.dish_name}
                                </span>
                                <span className="text-xs text-stone-400">
                                  {meal.calories ?? "?"} kcal
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  setSwapTarget({
                                    dayIndex: di,
                                    mealType: mt,
                                    currentDish: meal.dish_name,
                                  })
                                }
                                className="text-primary-500 hover:text-primary-600 shrink-0 p-0.5"
                                title="Reemplazar"
                              >
                                <RefreshCw size={14} />
                              </button>
                            </div>

                            {/* Rating */}
                            <div className="flex gap-0.5 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleRate(meal.id, star)}
                                  className="p-0.5"
                                >
                                  <Star
                                    size={12}
                                    className={
                                      (meal.user_rating ?? 0) >= star
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-stone-300"
                                    }
                                  />
                                </button>
                              ))}
                            </div>

                            {/* Expanded details */}
                            {expandedMeal === meal.id && (
                              <div className="mt-2 pt-2 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                                <p>
                                  P: {meal.protein_g ?? "?"}g · C: {meal.carbs_g ?? "?"}g · F:{" "}
                                  {meal.fiber_g ?? "?"}g
                                </p>
                                <p className="text-stone-400">{meal.portions}</p>
                                {meal.ingredients?.length > 0 && (
                                  <div>
                                    <p className="font-medium text-stone-500 text-xs mb-0.5">
                                      Ingredientes:
                                    </p>
                                    <ul className="list-disc list-inside space-y-0.5">
                                      {meal.ingredients.map((ing: any, i: number) => (
                                        <li key={i}>
                                          {ing.name}: {ing.amount}
                                          {ing.unit}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {meal.recipe_steps?.length > 0 && (
                                  <div>
                                    <p className="font-medium text-stone-500 text-xs mb-0.5">
                                      Preparación:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-0.5">
                                      {meal.recipe_steps.map((step: string, i: number) => (
                                        <li key={i}>{step}</li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full min-h-[60px] flex items-center justify-center">
                            <span className="text-stone-300 text-xs">—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Snacks */}
      {menu.meals?.some((m) => m.is_snack) && (
        <section className="bg-white rounded-xl p-4 shadow-sm border border-stone-200">
          <h3 className="text-sm font-semibold text-stone-600 mb-2">🥜 Snacks</h3>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day, di) => {
              const snacks = getSnacks(di);
              return snacks.map((snack) => (
                <span key={snack.id}
                  className="text-xs bg-stone-50 border border-stone-200 rounded-full px-3 py-1">
                  {day}: {snack.dish_name} ({snack.calories ?? "?"} kcal)
                </span>
              ));
            })}
          </div>
        </section>
      )}

      {/* Swap Modal */}
      {swapTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4"
          onClick={() => setSwapTarget(null)}>
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-stone-800">
              Reemplazar {swapTarget.mealType} — {DAYS[swapTarget.dayIndex]}
            </h3>
            <p className="text-sm text-stone-500">
              Plato actual: <span className="font-medium text-stone-700">{swapTarget.currentDish}</span>
            </p>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Ingredientes que quiero usar</label>
              <input type="text" value={swapIngredients} onChange={(e) => setSwapIngredients(e.target.value)}
                placeholder="pollo, verduras" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Antojo / preferencia</label>
              <input type="text" value={swapCravings} onChange={(e) => setSwapCravings(e.target.value)}
                placeholder="algo con salsa verde" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Evitar</label>
              <input type="text" value={swapAvoid} onChange={(e) => setSwapAvoid(e.target.value)}
                placeholder="lácteos" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSwap} disabled={swapMeal.isPending}
                className="flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
                {swapMeal.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {swapMeal.isPending ? "Reemplazando..." : "Sugerir nuevo platillo"}
              </button>
              <button onClick={() => setSwapTarget(null)}
                className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
