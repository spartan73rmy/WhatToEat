import { X } from "lucide-react";
import { useState } from "react";

interface AddToMenuModalProps {
  open: boolean;
  onClose: () => void;
  dish: { dish_name: string; calories?: number } | null;
  menus: { id: number; name: string }[];
  onAdd: (menuId: number, dayIndex: number, mealType: string) => void;
}

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const mealTypes = ["desayuno", "almuerzo", "comida", "merienda", "cena"];

export default function AddToMenuModal({ open, onClose, dish, menus, onAdd }: AddToMenuModalProps) {
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [mealType, setMealType] = useState("comida");

  if (!open || !dish) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Agregar a Menú</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm font-medium mb-4">{dish.dish_name} — {dish.calories} kcal</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Menú</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={selectedMenu ?? ""}
              onChange={(e) => setSelectedMenu(parseInt(e.target.value))}
            >
              <option value="" disabled>Seleccionar menú</option>
              {menus.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Día</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={dayIndex}
              onChange={(e) => setDayIndex(parseInt(e.target.value))}
            >
              {days.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Tipo de comida</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              {mealTypes.map((mt) => (
                <option key={mt} value={mt}>{mt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Cancelar
          </button>
          <button
            onClick={() => {
              if (selectedMenu !== null) {
                onAdd(selectedMenu, dayIndex, mealType);
                onClose();
              }
            }}
            disabled={selectedMenu === null}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-40"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
