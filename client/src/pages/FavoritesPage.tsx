import { useFavorites } from "../hooks/useFavorites";
import FavoriteCard from "../components/favorites/FavoriteCard";

export default function FavoritesPage() {
  const { favorites, isLoading, removeFavorite } = useFavorites();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Favoritos</h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando favoritos...</div>
      ) : !favorites || favorites.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No tienes platillos guardados como favoritos</p>
          <p className="text-sm text-gray-400 mt-1">
            Explora platillos y guárdalos con el ícono ❤
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favorites.map((dish: any) => (
            <FavoriteCard key={dish.id} dish={dish} onRemove={removeFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
