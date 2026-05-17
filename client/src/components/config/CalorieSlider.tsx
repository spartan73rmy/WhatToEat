import { useConfig } from "../../hooks/useConfig";

export default function CalorieSlider() {
  const { config, updateConfig } = useConfig();
  if (!config) return null;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">🔥 Límite calórico</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">800</span>
        <input
          type="range"
          min={800}
          max={3000}
          step={50}
          value={config.calorie_limit}
          onChange={(e) => updateConfig({ calorie_limit: parseInt(e.target.value) })}
          className="flex-1 accent-amber-600"
        />
        <span className="text-sm text-gray-500">3000</span>
        <span className="text-lg font-bold text-amber-700 min-w-[80px] text-right">
          {config.calorie_limit} kcal
        </span>
      </div>
    </div>
  );
}
