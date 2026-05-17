import { useConfig } from "../../hooks/useConfig";

const genders = ["mujer", "hombre", "otro"];
const activities = ["sedentaria", "ligera", "moderada", "activa", "muy_activa"];
const goals = ["bajar_peso", "mantener_peso", "subir_peso", "ganar_musculo"];

export default function ProfileForm() {
  const { config, updateConfig } = useConfig();

  if (!config) return null;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">👤 Perfil</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={config.age}
            onChange={(e) => updateConfig({ age: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={config.gender}
            onChange={(e) => updateConfig({ gender: e.target.value })}
          >
            {genders.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actividad</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={config.activity}
            onChange={(e) => updateConfig({ activity: e.target.value })}
          >
            {activities.map((a) => (
              <option key={a} value={a}>{a.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={config.goal}
            onChange={(e) => updateConfig({ goal: e.target.value })}
          >
            {goals.map((g) => (
              <option key={g} value={g}>{g.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Déficit calórico
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={config.calorie_deficit}
            onChange={(e) => updateConfig({ calorie_deficit: parseInt(e.target.value) })}
          >
            <option value={0}>0 kcal</option>
            <option value={250}>250 kcal</option>
            <option value={500}>500 kcal</option>
            <option value={750}>750 kcal</option>
            <option value={1000}>1000 kcal</option>
          </select>
        </div>
      </div>
    </div>
  );
}
