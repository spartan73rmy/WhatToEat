import { useFavorites, useRemoveFavorite } from "../hooks/useFavorites";
import { Trash2, ChefHat, Heart } from "lucide-react";

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();
  const removeFav = useRemoveFavorite();

  if (isLoading) return <p className="text-center py-20">Cargando...</p>;

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-2">
        <Heart size={24} className="text-rose-400" />
        <h1 className="text-2xl font-bold text-stone-800">Mis Favoritos</h1>
      </div>

      {favorites?.length === 0 && (
        <div className="text-center py-20">
          <ChefHat size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-400">Aún no tienes platillos favoritos.</p>
          <p className="text-sm text-stone-300">Explora y guarda los que más te gusten.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites?.map((fav) => (
          <div key={fav.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-stone-800 text-sm leading-tight">
                {fav.dish_name}
              </h3>
              <button onClick={() => removeFav.mutate(fav.id)}
                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex gap-2 text-xs text-stone-400">
              {fav.meal_type && (
                <span className="bg-stone-100 rounded-full px-2 py-0.5 capitalize">
                  {fav.meal_type}
                </span>
              )}
              {fav.calories && (
                <span className="bg-stone-100 rounded-full px-2 py-0.5">
                  {fav.calories} kcal
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              P: {fav.protein_g ?? "?"}g · C: {fav.carbs_g ?? "?"}g · F: {fav.fiber_g ?? "?"}g
            </p>
            {fav.ingredients?.length > 0 && (
              <div className="text-xs text-stone-400">
                <p className="font-medium text-stone-500 mb-0.5">Ingredientes:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {fav.ingredients.map((ing: any, i: number) => (
                    <li key={i}>{ing.name}: {ing.amount}{ing.unit}</li>
                  ))}
                </ul>
              </div>
            )}
            {fav.recipe_steps?.length > 0 && (
              <div className="text-xs text-stone-400">
                <p className="font-medium text-stone-500 mb-0.5">Preparación:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  {fav.recipe_steps.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            {fav.notes && <p className="text-xs text-stone-400 italic">"{fav.notes}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
