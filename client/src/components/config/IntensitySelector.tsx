import { useConfig } from "../../hooks/useConfig";

const intensities = ["ligero", "normal", "sustancioso"];

const mealLabels: Record<string, string> = {
  breakfast_intensity: "Desayuno",
  almuerzo_intensity: "Almuerzo",
  comida_intensity: "Comida",
  merienda_intensity: "Merienda",
  cena_intensity: "Cena",
};

export default function IntensitySelector() {
  const { config, updateConfig } = useConfig();
  if (!config) return null;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">📊 Intensidad</h2>
      <div className="space-y-3">
        {Object.entries(mealLabels).map(([key, label]) => {
          const value = config[key as keyof typeof config] as string;
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm w-24 font-medium">{label}</span>
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
