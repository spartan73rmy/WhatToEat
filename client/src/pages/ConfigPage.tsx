import { useState } from "react";
import { Sparkles } from "lucide-react";
import ProfileForm from "../components/config/ProfileForm";
import MealDistributionPicker from "../components/config/MealDistributionPicker";
import IntensitySelector from "../components/config/IntensitySelector";
import CalorieSlider from "../components/config/CalorieSlider";
import { useConfig } from "../hooks/useConfig";

const cuisinesList = [
  "Japonesa", "Mexicana", "Italiana", "Mediterránea",
  "India", "China", "Tailandesa", "Coreana",
  "Francesa", "Peruana", "Árabe", "Griega",
];

export default function ConfigPage() {
  const { config, updateConfig } = useConfig();
  const [suggesting, setSuggesting] = useState(false);

  if (!config) {
    return <div className="text-center py-12 text-gray-400">Cargando configuración...</div>;
  }

  const toggleCuisine = (cuisine: string) => {
    const current = config.default_cuisines || [];
    const next = current.includes(cuisine)
      ? current.filter((c: string) => c !== cuisine)
      : [...current, cuisine];
    updateConfig({ default_cuisines: next });
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Configuración General</h1>
      <ProfileForm />
      <MealDistributionPicker />
      <IntensitySelector />
      <CalorieSlider />

      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">🥘 Cocinas preferidas</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {cuisinesList.map((c) => {
            const selected = (config.default_cuisines || []).includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCuisine(c)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selected
                    ? "bg-amber-100 border-amber-400 text-amber-800"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setSuggesting(true)}
          className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800"
        >
          <Sparkles size={16} />
          Sugerir cocinas con IA
        </button>
        {suggesting && (
          <p className="text-xs text-gray-400 mt-2">
            Función de IA próximamente...
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">↻ Los cambios se guardan automáticamente</p>
    </div>
  );
}
