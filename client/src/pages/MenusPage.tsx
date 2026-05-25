import { useState } from "react";
import { Link } from "react-router-dom";
import { useMenus, useDeleteMenu, useGenerateMenu } from "../hooks/useMenus";
import { useConfig } from "../hooks/useConfig";
import { CUISINES, DAYS } from "../types";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";

export default function MenusPage() {
  const { data: menus, isLoading } = useMenus();
  const { data: config } = useConfig();
  const deleteMenu = useDeleteMenu();
  const generateMenu = useGenerateMenu();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("rapida");
  const [pantry, setPantry] = useState("");
  const [suggesting, setSuggesting] = useState(false);

  const handleGenerate = async () => {
    if (!name || cuisines.length === 0) return;
    await generateMenu.mutateAsync({
      name,
      cuisines,
      difficulty,
      pantry: pantry.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setName("");
    setCuisines([]);
    setPantry("");
    setShowForm(false);
  };

  const suggestCuisines = async () => {
    setSuggesting(true);
    try {
      const res = await fetch("/api/ai/suggest-cuisines", { method: "POST" });
      const data = await res.json();
      if (data.cuisines) setCuisines(data.cuisines);
    } catch (e) {
      console.error(e);
    } finally {
      setSuggesting(false);
    }
  };

  const toggleCuisine = (c: string) => {
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  if (isLoading) return <p className="text-center py-20">Cargando...</p>;

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Mis Menús</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
          <Plus size={18} /> Nuevo Menú
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-4">
          <h2 className="font-semibold text-lg">Nuevo Menú Semanal</h2>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Semana 1" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          {config && (
            <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-500 space-y-0.5">
              <p>Datos precargados: {config.age} años, {config.gender}, {config.activity}</p>
              <p>Objetivo: {config.goal.replace("_", " ")} · Déficit: {config.calorie_deficit} kcal</p>
              <p>Límite: {config.calorie_limit} kcal/día · {config.meal_pattern.replace("_", " ")}</p>
              <p className="text-xs text-stone-400">Estos datos vienen de tu configuración global</p>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-stone-600">Cocinas</label>
              <button onClick={suggestCuisines} disabled={suggesting}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50">
                <Sparkles size={14} /> {suggesting ? "Pensando..." : "Sugerir con IA"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CUISINES.map((c) => (
                <button key={c} onClick={() => toggleCuisine(c)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                    cuisines.includes(c)
                      ? "bg-primary-100 text-primary-700 border border-primary-300"
                      : "bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200"
                  }`}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Dificultad</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
                <option value="rapida">Rápida (&lt;30 min)</option>
                <option value="compleja">Compleja</option>
                <option value="cualquiera">Cualquiera</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Despensa (opcional)</label>
              <input type="text" value={pantry} onChange={(e) => setPantry(e.target.value)}
                placeholder="pollo, arroz, frijoles" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleGenerate} disabled={generateMenu.isPending || !name || cuisines.length === 0}
              className="flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
              {generateMenu.isPending ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {generateMenu.isPending ? "Generando..." : "Generar con IA"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {menus?.length === 0 && (
          <p className="text-center py-10 text-stone-400">
            Aún no tienes menús. ¡Crea uno!
          </p>
        )}
        {menus?.map((menu) => (
          <div key={menu.id}
            className="bg-white rounded-xl p-5 shadow-sm border border-stone-200 flex items-center justify-between">
            <div>
              <Link to={`/menus/${menu.id}`} className="font-semibold text-stone-800 hover:text-primary-600 transition-colors">
                {menu.name}
              </Link>
              <p className="text-xs text-stone-400 mt-1">
                {new Date(menu.created_at).toLocaleDateString("es-MX")}
                {menu.cuisine_overrides?.length ? ` · ${menu.cuisine_overrides.join(", ")}` : ""}
                {menu.difficulty ? ` · ${menu.difficulty}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/menus/${menu.id}`}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Ver →
              </Link>
              <button onClick={() => deleteMenu.mutate(menu.id)}
                className="text-stone-400 hover:text-red-500 transition-colors p-1">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
