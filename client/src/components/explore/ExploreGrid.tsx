import DishCard from "./DishCard";

interface ExploreGridProps {
  dishes: any[];
  onAdd: (dish: any) => void;
  onFavorite: (dish: any) => void;
}

export default function ExploreGrid({ dishes, onAdd, onFavorite }: ExploreGridProps) {
  if (!dishes || dishes.length === 0) {
    return <p className="text-center text-gray-400 py-8">No hay platillos para mostrar</p>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {dishes.map((dish, i) => (
        <DishCard
          key={i}
          dish={dish}
          onAdd={() => onAdd(dish)}
          onFavorite={() => onFavorite(dish)}
        />
      ))}
    </div>
  );
}
