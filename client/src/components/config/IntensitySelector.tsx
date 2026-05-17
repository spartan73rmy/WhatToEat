import { useConfig } from "../../hooks/useConfig";

const intensities = ["ligero", "normal", "sustancioso"];

const patternsToKeys: Record<string, string[]> = {
  "3_comidas": ["breakfast_intensity", "comida_intensity", "cena_intensity"],
  "4_comidas": ["breakfast_intensity", "almuerzo_intensity", "comida_intensity", "cena_intensity"],
  "5_comidas": ["breakfast_intensity", "almuerzo_intensity", "comida_intensity", "merienda_intensity", "cena_intensity"],
};

const keyLabels: Record<string, string> = {
  breakfast_intensity: "Desayuno",
  almuerzo_intensity: "Almuerzo",
  comida_intensity: "Comida",
  merienda_intensity: "Merienda",
  cena_intensity: "Cena",
};

export default function IntensitySelector() {
  const { config, updateConfig } = useConfig();
  if (!config) return null;

  const keys = patternsToKeys[config.meal_pattern] || patternsToKeys["5_comidas"];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">📊 Intensidad</h2>
      <div className="space-y-3">
        {keys.map((key) => {
          const value = config[key as keyof typeof config] as string;
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm w-24 font-medium">{keyLabels[key]}</span>
              <select
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                value={value}
                onChange={(e) => updateConfig({ [key]: e.target.value })}
              >
                {intensities.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
