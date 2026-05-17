import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import ProfileForm from "../components/config/ProfileForm";
import MealDistributionPicker from "../components/config/MealDistributionPicker";
import IntensitySelector from "../components/config/IntensitySelector";
import CalorieSlider from "../components/config/CalorieSlider";
import { useConfig } from "../hooks/useConfig";
import { configApi } from "../api/configApi";

const cuisinesList = [
  "Japonesa", "Mexicana", "Italiana", "Mediterránea",
  "India", "China", "Tailandesa", "Coreana",
  "Francesa", "Peruana", "Árabe", "Griega",
];

export default function ConfigPage() {
  const queryClient = useQueryClient();
  const { config, updateConfig } = useConfig();
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState("");

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

  const handleSuggest = async () => {
    setSuggesting(true);
    setSuggestError("");
    try {
      const cuisines = await configApi.suggestCuisines();
      if (!Array.isArray(cuisines) || cuisines.length === 0) {
        setSuggestError("La IA no devolvió cocinas válidas. Intenta de nuevo.");
        return;
      }
      await configApi.update({ default_cuisines: cuisines });
      queryClient.invalidateQueries({ queryKey: ["config"] });
    } catch (err: any) {
      setSuggestError(err?.message || "Error al sugerir cocinas. Verifica que Ollama esté corriendo.");
      console.error("Error suggesting cuisines:", err);
    } finally {
      setSuggesting(false);
    }
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
          onClick={handleSuggest}
          disabled={suggesting}
          className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 disabled:opacity-50"
        >
          {suggesting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {suggesting ? "Sugiriendo..." : "Sugerir cocinas con IA"}
        </button>
        {suggestError && (
          <p className="text-xs text-red-500 mt-2">{suggestError}</p>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">↻ Los cambios se guardan automáticamente</p>
    </div>
  );
}
