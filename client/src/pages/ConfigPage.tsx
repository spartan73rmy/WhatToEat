import { useState, useEffect } from "react";
import { useConfig, useUpdateConfig } from "../hooks/useConfig";
import { CUISINES } from "../types";
import { Sparkles, Save } from "lucide-react";

export default function ConfigPage() {
  const { data: config, isLoading } = useConfig();
  const updateConfig = useUpdateConfig();

  const [form, setForm] = useState<Record<string, any>>({});
  const [suggesting, setSuggesting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const set = (key: string, value: any) => {
    const next = { ...form, [key]: value };
    setForm(next);
    updateConfig.mutate(next, { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 1500); } });
  };

  const suggestCuisines = async () => {
    setSuggesting(true);
    try {
      const res = await fetch("/api/ai/suggest-cuisines", { method: "POST" });
      const data = await res.json();
      if (data.cuisines) set("default_cuisines", data.cuisines);
    } catch (e) {
      console.error(e);
    } finally {
      setSuggesting(false);
    }
  };

  if (isLoading) return <p className="text-center py-20">Cargando...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Configuración General</h1>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <Save size={16} /> Guardado
          </span>
        )}
      </div>

      {/* Profile */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-4">
        <h2 className="font-semibold text-lg">👤 Perfil</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Edad</label>
            <input type="number" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              value={form.age ?? 28} onChange={(e) => set("age", Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Género</label>
            <select className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              value={form.gender ?? "mujer"} onChange={(e) => set("gender", e.target.value)}>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Actividad</label>
            <select className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              value={form.activity ?? "sedentaria"} onChange={(e) => set("activity", e.target.value)}>
              <option value="sedentaria">Sedentaria</option>
              <option value="ligera">Ligera</option>
              <option value="moderada">Moderada</option>
              <option value="activa">Activa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Objetivo</label>
            <select className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              value={form.goal ?? "bajar_peso"} onChange={(e) => set("goal", e.target.value)}>
              <option value="bajar_peso">Bajar de peso</option>
              <option value="mantener">Mantener</option>
              <option value="aumentar_masa">Aumentar masa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Déficit calórico</label>
            <select className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              value={form.calorie_deficit ?? 500} onChange={(e) => set("calorie_deficit", Number(e.target.value))}>
              <option value={0}>0 kcal (mantener)</option>
              <option value={300}>300 kcal</option>
              <option value={500}>500 kcal</option>
              <option value={800}>800 kcal</option>
            </select>
          </div>
        </div>
      </section>

      {/* Meal Distribution */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-4">
        <h2 className="font-semibold text-lg">🍽 Distribución de comidas</h2>
        <div className="flex gap-2">
          {["3_comidas", "4_comidas", "5_comidas"].map((p) => (
            <button key={p} onClick={() => set("meal_pattern", p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                form.meal_pattern === p ? "bg-primary-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}>
              {p.replace("_", " ")}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!form.include_snacks}
            onChange={(e) => set("include_snacks", e.target.checked)} className="rounded" />
          Incluir snacks entre comidas
        </label>
      </section>

      {/* Intensity */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-4">
        <h2 className="font-semibold text-lg">📊 Intensidad por comida</h2>
        {["breakfast", "almuerzo", "comida", "cena"].map((meal) => {
          const key = `${meal}_intensity`;
          return (
            <div key={meal} className="flex items-center gap-3">
              <span className="w-24 text-sm capitalize text-stone-600">{meal === "comida" ? "Comida" : meal}</span>
              <select value={form[key] ?? "normal"} onChange={(e) => set(key, e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm flex-1">
                <option value="ligero">Ligero</option>
                <option value="normal">Normal</option>
                <option value="sustancioso">Sustancioso</option>
              </select>
            </div>
          );
        })}
      </section>

      {/* Calorie limit */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-4">
        <h2 className="font-semibold text-lg">🔥 Límite calórico diario</h2>
        <div className="flex items-center gap-4">
          <input type="range" min={800} max={3500} step={100}
            value={form.calorie_limit ?? 1400}
            onChange={(e) => set("calorie_limit", Number(e.target.value))}
            className="flex-1 accent-primary-500" />
          <span className="text-lg font-bold text-primary-600 min-w-[5rem] text-right">
            {form.calorie_limit ?? 1400} kcal
          </span>
        </div>
      </section>

      {/* Cuisines */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">🥘 Cocinas preferidas</h2>
          <button onClick={suggestCuisines} disabled={suggesting}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50">
            <Sparkles size={16} /> {suggesting ? "Pensando..." : "Sugerir con IA"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((c) => (
            <button key={c} onClick={() => {
              const current = form.default_cuisines ?? [];
              const next = current.includes(c) ? current.filter((x: string) => x !== c) : [...current, c];
              set("default_cuisines", next);
            }}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                (form.default_cuisines ?? []).includes(c)
                  ? "bg-primary-100 text-primary-700 border border-primary-300"
                  : "bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200"
              }`}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-stone-400">Los cambios se guardan automáticamente</p>
    </div>
  );
}
