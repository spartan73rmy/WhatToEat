import { useConfig } from "../../hooks/useConfig";

const patterns = ["3_comidas", "4_comidas", "5_comidas"];

export default function MealDistributionPicker() {
  const { config, updateConfig } = useConfig();
  if (!config) return null;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">🍽 Distribución</h2>
      <div className="flex gap-4 mb-3 flex-wrap">
        {patterns.map((p) => (
          <label key={p} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="meal_pattern"
              checked={config.meal_pattern === p}
              onChange={() => updateConfig({ meal_pattern: p })}
              className="accent-amber-600"
            />
            <span className="text-sm">{p.replace("_", " ")}</span>
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.include_snacks}
          onChange={(e) => updateConfig({ include_snacks: e.target.checked })}
          className="accent-amber-600"
        />
        <span className="text-sm font-medium">Incluir snacks entre comidas</span>
      </label>
    </div>
  );
}
