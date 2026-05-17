const mealTypes = [
  { value: "", label: "Cualquier comida" },
  { value: "desayuno", label: `🌅 Desayuno` },
  { value: "almuerzo", label: `🥪 Almuerzo` },
  { value: "comida", label: `🍽️ Comida` },
  { value: "merienda", label: `🍪 Merienda` },
  { value: "cena", label: `🌙 Cena` },
];

const difficulties = [
  { value: "", label: "Cualquier dificultad" },
  { value: "facil", label: "Fácil" },
  { value: "media", label: "Media" },
  { value: "dificil", label: "Difícil" },
];

const costs = [
  { value: "", label: "Cualquier precio" },
  { value: "barato", label: "Barato" },
  { value: "medio", label: "Medio" },
  { value: "caro", label: "Caro" },
  { value: "muy_caro", label: "Muy caro" },
];

import { Loader2, Square } from "lucide-react";

interface ExploreFiltersProps {
  mealType: string;
  difficulty: string;
  cost: string;
  craving: string;
  searching?: boolean;
  onChange: (filters: { mealType: string; difficulty: string; cost: string; craving: string }) => void;
  onSearch: () => void;
}

export default function ExploreFilters({ mealType, difficulty, cost, craving, searching, onChange, onSearch }: ExploreFiltersProps) {
  const update = (patch: Partial<{ mealType: string; difficulty: string; cost: string; craving: string }>) => {
    onChange({ mealType, difficulty, cost, craving, ...patch });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo de comida</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={mealType}
            onChange={(e) => update({ mealType: e.target.value })}
          >
            {mealTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Dificultad</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={difficulty}
            onChange={(e) => update({ difficulty: e.target.value })}
          >
            {difficulties.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Precio</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={cost}
            onChange={(e) => update({ cost: e.target.value })}
          >
            {costs.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">¿Antojo?</label>
          <input
            type="text"
            placeholder="Ej. algo picante, pasta..."
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={craving}
            onChange={(e) => update({ craving: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
          />
        </div>
      </div>
      <button
        onClick={onSearch}
        className={`w-full sm:w-auto px-5 py-2 text-sm rounded-lg transition-colors font-medium flex items-center gap-2 ${
          searching
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-amber-600 hover:bg-amber-700 text-white"
        }`}
      >
        {searching ? <Square size={16} /> : <Loader2 size={16} />}
        {searching ? "Detener" : "Buscar platillos"}
      </button>
    </div>
  );
}
