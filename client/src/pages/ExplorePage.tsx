import { useState, useCallback, useRef } from "react";
import { useExplore } from "../hooks/useExplore";
import { useMenus } from "../hooks/useMenus";
import { useFavorites } from "../hooks/useFavorites";
import { exploreApi } from "../api/configApi";
import ExploreGrid from "../components/explore/ExploreGrid";
import AddToMenuModal from "../components/menus/AddToMenuModal";

export default function ExplorePage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useExplore();
  const { menus } = useMenus();
  const { addFavorite } = useFavorites();
  const [addDish, setAddDish] = useState<any>(null);

  const dishes = data?.pages.flatMap((page) => page) || [];

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

  const handleAddToMenu = async (menuId: number, dayIndex: number, mealType: string) => {
    try {
      await exploreApi.addToMenu({ menuId, dayIndex, mealType, dish: addDish });
    } catch (err) {
      console.error("Error adding to menu:", err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Explorar Platillos</h1>
      <p className="text-sm text-gray-500 mb-6">Basado en tu perfil nutricional</p>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando platillos...</div>
      ) : (
        <>
          <ExploreGrid
            dishes={dishes}
            onAdd={(dish) => setAddDish(dish)}
            onFavorite={(dish) => addFavorite(dish)}
          />
          <div ref={lastRef} className="py-8 text-center text-sm text-gray-400">
            {isFetchingNextPage
              ? "Cargando más platillos..."
              : hasNextPage
              ? "Desplázate para más"
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
