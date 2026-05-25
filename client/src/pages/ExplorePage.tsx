import { useEffect, useState } from "react";
import { useExplore, addDishToMenu } from "../hooks/useExplore";
import { useMenus } from "../hooks/useMenus";
import { useAddFavorite } from "../hooks/useFavorites";
import { ExploreDish, DAYS } from "../types";
import { Heart, Plus, Loader2, ChefHat } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function ExplorePage() {
  const { dishes, loading, hasMore, loadMore, reset } = useExplore();
  const { data: menus } = useMenus();
  const addFav = useAddFavorite();

  const [showAddModal, setShowAddModal] = useState<ExploreDish | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMealType, setSelectedMealType] = useState("comida");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (dishes.length === 0) loadMore();
  }, []);

  const handleAddToMenu = async () => {
    if (!showAddModal || !selectedMenu) return;
    setAdding(true);
    try {
      await addDishToMenu({
        menuId: selectedMenu,
        dayIndex: selectedDay,
        mealType: selectedMealType,
        dish: showAddModal,
      });
      setShowAddModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleFavorite = (dish: ExploreDish) => {
    addFav.mutate({
      dish_name: dish.dish_name,
      meal_type: dish.meal_type,
      calories: dish.calories,
      protein_g: dish.protein_g,
      carbs_g: dish.carbs_g,
      fiber_g: dish.fiber_g,
      portions: dish.portions,
      ingredients: dish.ingredients,
      recipe_steps: dish.recipe_steps,
      cuisine: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">🔍 Explorar Platillos</h1>
          <p className="text-sm text-stone-400 mt-1">
                    Basado en tu perfil — scroll infinito de sugerencias
                  </p>
        </div>
        <button onClick={() => { reset(); loadMore(); }}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
          <ChefHat size={16} /> Nuevas sugerencias
        </button>
      </div>

      {dishes.length === 0 && loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      )}

      <InfiniteScroll
        dataLength={dishes.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div className="flex items-center justify-center py-8 text-stone-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Cargando más platillos...
          </div>
        }
        endMessage={<p className="text-center text-stone-400 py-8">No hay más platillos por ahora</p>}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {dishes.map((dish, i) => (
          <div key={`${dish.dish_name}-${i}`}
            className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-stone-800 text-sm leading-tight">
                {dish.dish_name}
              </h3>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setShowAddModal(dish)}
                  className="p-1.5 text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Agregar a menú">
                  <Plus size={16} />
                </button>
                <button onClick={() => handleFavorite(dish)}
                  className="p-1.5 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Guardar como favorito">
                  <Heart size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 text-xs text-stone-400">
              <span className="bg-stone-100 rounded-full px-2 py-0.5 capitalize">
                {dish.meal_type}
              </span>
              <span className="bg-stone-100 rounded-full px-2 py-0.5">
                {dish.calories ?? "?"} kcal
              </span>
            </div>
            <p className="text-xs text-stone-500">
              P: {dish.protein_g ?? "?"}g · C: {dish.carbs_g ?? "?"}g · F: {dish.fiber_g ?? "?"}g
            </p>
            {dish.ingredients?.length > 0 && (
              <p className="text-xs text-stone-400 truncate">
                {dish.ingredients.map((i: any) => i.name).join(", ")}
              </p>
            )}
          </div>
        ))}
      </InfiniteScroll>

      {/* Add to Menu Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4"
          onClick={() => setShowAddModal(null)}>
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-stone-800">Agregar a menú</h3>
            <p className="text-sm text-stone-600">
              <span className="font-medium">{showAddModal.dish_name}</span>
            </p>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Menú</label>
              <select value={selectedMenu ?? ""} onChange={(e) => setSelectedMenu(Number(e.target.value))}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {menus?.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Día</label>
                <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Comida</label>
                <select value={selectedMealType} onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
                  {["desayuno", "almuerzo", "comida", "merienda", "cena", "snack"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleAddToMenu} disabled={!selectedMenu || adding}
                className="flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
                {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Agregar
              </button>
              <button onClick={() => setShowAddModal(null)}
                className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
