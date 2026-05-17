import { X } from "lucide-react";
import { useState } from "react";

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
  currentDish: string;
  mealType: string;
  dayLabel: string;
  onSwap: (params: {
    preferredIngredients?: string;
    cravings?: string;
    avoidIngredients?: string;
  }) => void;
  swapping: boolean;
}

export default function SwapModal({
  open,
  onClose,
  currentDish,
  mealType,
  dayLabel,
  onSwap,
  swapping,
}: SwapModalProps) {
  const [preferred, setPreferred] = useState("");
  const [cravings, setCravings] = useState("");
  const [avoid, setAvoid] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    onSwap({
      preferredIngredients: preferred || undefined,
      cravings: cravings || undefined,
      avoidIngredients: avoid || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Reemplazar Comida</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {dayLabel} — <span className="font-medium">{mealType}</span>
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Plato actual: <span className="text-gray-700">{currentDish}</span>
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Ingredientes que quiero
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="pollo, verduras..."
              value={preferred}
              onChange={(e) => setPreferred(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Antojo</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="algo con salsa verde"
              value={cravings}
              onChange={(e) => setCravings(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Evitar</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="lácteos..."
              value={avoid}
              onChange={(e) => setAvoid(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={swapping}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-40"
          >
            {swapping ? "Generando..." : "Sugerir nuevo platillo"}
          </button>
        </div>
      </div>
    </div>
  );
}
