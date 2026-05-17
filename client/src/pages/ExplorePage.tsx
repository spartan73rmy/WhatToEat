import { useState, useCallback, useRef } from "react";
import { useExplore } from "../hooks/useExplore";
import { useMenus } from "../hooks/useMenus";
import { useFavorites } from "../hooks/useFavorites";
import { exploreApi } from "../api/configApi";
import ExploreGrid from "../components/explore/ExploreGrid";
import ExploreFilters from "../components/explore/ExploreFilters";
import AddToMenuModal from "../components/menus/AddToMenuModal";

export default function ExplorePage() {
  const [mealType, setMealType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [cost, setCost] = useState("");
  const [craving, setCraving] = useState("");
  const [searchKey, setSearchKey] = useState(0);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, cancel } = useExplore(
    searchKey > 0,
    searchKey > 0 ? { meal_type: mealType || undefined, difficulty: difficulty || undefined, cost: cost || undefined, craving: craving || undefined } : undefined
  );
  const { menus } = useMenus();
  const { favorites, addFavorite } = useFavorites();
  const [addDish, setAddDish] = useState<any>(null);
  const addingFav = useRef(false);

  const dishes = data?.pages.flatMap((page) => page) || [];
  const favoriteNames = new Set((favorites || []).map((f: any) => f.dish_name));

  const observer = useRef<IntersectionObserver>();
  const lastRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const handleSearch = () => {
    if (isFetching) {
      cancel();
    } else {
      setSearchKey((k) => k + 1);
    }
  };

  const handleAddToMenu = async (menuId: number, dayIndex: number, mealType: string) => {
    try {
      await exploreApi.addToMenu({ menuId, dayIndex, mealType, dish: addDish });
    } catch (err) {
      console.error("Error adding to menu:", err);
    }
  };

  const handleFavorite = async (dish: any) => {
    if (addingFav.current) return;
    addingFav.current = true;
    try {
      await addFavorite(dish);
    } catch (err) {
      console.error("Error adding favorite:", err);
    } finally {
      addingFav.current = false;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Explorar Platillos</h1>
      <p className="text-sm text-gray-500 mb-6">Basado en tu perfil nutricional</p>

      <ExploreFilters
        mealType={mealType}
        difficulty={difficulty}
        cost={cost}
        craving={craving}
        searching={isFetching}
        onChange={({ mealType: mt, difficulty: d, cost: co, craving: cr }) => {
          setMealType(mt);
          setDifficulty(d);
          setCost(co);
          setCraving(cr);
        }}
        onSearch={handleSearch}
      />

      {searchKey === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-2">Usa los filtros de arriba para encontrar platillos</p>
          <p className="text-sm text-gray-400">Selecciona tipo de cocina, dificultad, precio o tu antojo</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando platillos...</div>
      ) : (
        <>
          <ExploreGrid
            dishes={dishes}
            favoriteNames={favoriteNames}
            onAdd={(dish) => setAddDish(dish)}
            onFavorite={handleFavorite}
          />
          <div ref={lastRef} className="py-8 text-center text-sm text-gray-400">
            {isFetchingNextPage
              ? "Cargando más platillos..."
              : hasNextPage
              ? "Desplázate para más"
              : dishes.length === 0
              ? "No se encontraron platillos con esos filtros"
              : "No hay más platillos"}
          </div>
        </>
      )}

      <AddToMenuModal
        open={!!addDish}
        onClose={() => setAddDish(null)}
        dish={addDish}
        menus={menus || []}
        onAdd={handleAddToMenu}
      />
    </div>
  );
}
