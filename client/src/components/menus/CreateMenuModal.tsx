import { useState } from "react";
import { X } from "lucide-react";
import { menuApi } from "../../api/configApi";
import { useQueryClient } from "@tanstack/react-query";

interface CreateMenuModalProps {
  open: boolean;
  onClose: () => void;
}

const difficulties = ["facil", "media", "dificil"];
const cuisinesList = [
  "Japonesa", "Mexicana", "Italiana", "Mediterránea",
  "India", "China", "Tailandesa", "Coreana",
  "Francesa", "Peruana", "Árabe", "Griega",
];

export default function CreateMenuModal({ open, onClose }: CreateMenuModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"name" | "options">("name");
  const [name, setName] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("media");
  const [pantry, setPantry] = useState("");
  const [generating, setGenerating] = useState(false);

  if (!open) return null;

  const toggleCuisine = (c: string) => {
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await menuApi.generate({
        name,
        cuisines: cuisines.length > 0 ? cuisines : undefined,
        difficulty,
        pantry: pantry ? pantry.split(",").map((s) => s.trim()) : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      onClose();
      setName("");
      setCuisines([]);
      setDifficulty("media");
      setPantry("");
      setStep("name");
    } catch (err) {
      console.error("Error generating menu:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {step === "name" ? "Nuevo Menú" : "Opciones de generación"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {step === "name" ? (
          <>
            <input
              type="text"
              placeholder="Nombre del menú (ej. Semana 1)"
              className="w-full border rounded-lg px-4 py-2.5 text-sm mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStep("options")}
                disabled={!name.trim()}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Cocinas</label>
                <div className="flex flex-wrap gap-1.5">
                  {cuisinesList.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCuisine(c)}
                      className={`px-2.5 py-1 rounded-full text-xs border ${
                        cuisines.includes(c)
                          ? "bg-amber-100 border-amber-400 text-amber-800"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Dificultad</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {difficulties.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Ingredientes en despensa (separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="pollo, arroz, verduras..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={pantry}
                  onChange={(e) => setPantry(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setStep("name")}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Atrás
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-40 flex items-center gap-2"
              >
                {generating ? (
                  <>Generando... <span className="animate-spin">⏳</span></>
                ) : (
                  "Generar con IA"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
