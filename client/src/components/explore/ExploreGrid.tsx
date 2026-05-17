import DishCard from "./DishCard";

interface ExploreGridProps {
  dishes: any[];
  onAdd: (dish: any) => void;
  onFavorite: (dish: any) => void;
  favoriteNames?: Set<string>;
}

export default function ExploreGrid({ dishes, onAdd, onFavorite, favoriteNames }: ExploreGridProps) {
  if (!dishes || dishes.length === 0) {
    return <p className="text-center text-gray-400 py-8">No hay platillos para mostrar</p>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {dishes.map((dish, i) => (
        <DishCard
          key={`${dish.dish_name}-${i}`}
          dish={dish}
          onAdd={() => onAdd(dish)}
          onFavorite={() => onFavorite(dish)}
          favorited={favoriteNames?.has(dish.dish_name)}
        />
      ))}
    </div>
  );
}
