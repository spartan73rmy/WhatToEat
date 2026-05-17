import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface EditMealModalProps {
  open: boolean;
  onClose: () => void;
  meal: {
    id: number;
    menu_id?: number;
    dish_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fiber_g: number;
    portions: string;
  } | null;
  onSave: (mealId: number, data: Record<string, unknown>) => void;
}

export default function EditMealModal({ open, onClose, meal, onSave }: EditMealModalProps) {
  const [dishName, setDishName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fiber, setFiber] = useState(0);
  const [portions, setPortions] = useState("");

  useEffect(() => {
    if (meal) {
      setDishName(meal.dish_name);
      setCalories(meal.calories);
      setProtein(meal.protein_g);
      setCarbs(meal.carbs_g);
      setFiber(meal.fiber_g);
      setPortions(meal.portions);
    }
  }, [meal]);

  if (!open || !meal) return null;

  const handleSave = () => {
    onSave(meal.id, {
      dish_name: dishName,
      calories,
      protein_g: protein,
      carbs_g: carbs,
      fiber_g: fiber,
      portions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Editar Comida</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Platillo</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={dishName} onChange={(e) => setDishName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Calorías</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={calories} onChange={(e) => setCalories(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Proteína (g)</label>
              <input type="number" step="0.1" className="w-full border rounded-lg px-3 py-2 text-sm" value={protein} onChange={(e) => setProtein(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Carbohidratos (g)</label>
              <input type="number" step="0.1" className="w-full border rounded-lg px-3 py-2 text-sm" value={carbs} onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Fibra (g)</label>
              <input type="number" step="0.1" className="w-full border rounded-lg px-3 py-2 text-sm" value={fiber} onChange={(e) => setFiber(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Porciones</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={portions} onChange={(e) => setPortions(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">Guardar</button>
        </div>
      </div>
    </div>
  );
}
