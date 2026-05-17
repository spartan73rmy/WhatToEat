import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, ChevronDown, ChevronRight, CheckCircle2,
  Loader2, Save, XCircle, Circle
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";


interface CreateMenuModalProps {
  open: boolean;
  onClose: () => void;
}

const difficulties = ["facil", "media", "dificil"];
const costs = ["barato", "medio", "caro", "muy_caro"];
const costLabels: Record<string, string> = {
  barato: "💰 Barato",
  medio: "💰💰 Medio",
  caro: "💰💰💰 Caro",
  muy_caro: "💰💰💰💰 Muy caro",
};
const cuisinesList = [
  "Japonesa", "Mexicana", "Italiana", "Mediterránea",
  "India", "China", "Tailandesa", "Coreana",
  "Francesa", "Peruana", "Árabe", "Griega",
];

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const API_BASE = "/api";

interface DayState {
  dayName: string;
  status: "pending" | "generating" | "saving" | "done" | "error";
  dishes: string[];
  error?: string;
}

export default function CreateMenuModal({ open, onClose }: CreateMenuModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"name" | "options">("name");
  const [name, setName] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("media");
  const [cost, setCost] = useState("medio");
  const [pantry, setPantry] = useState("");
  const [generating, setGenerating] = useState(false);
  const generatingRef = useRef(false);
  const [days, setDays] = useState<DayState[]>([]);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState("");
  const detailsRef = useRef("");
  const detailsScrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setStep("name");
      setName("");
      setCuisines([]);
      setDifficulty("media");
      setCost("medio");
      setPantry("");
      setGenerating(false);
      generatingRef.current = false;
      setDays([]);
      setError("");
      setShowDetails(false);
      setDetails("");
      detailsRef.current = "";
    }
  }, [open]);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.scrollTop = progressRef.current.scrollHeight;
    }
  }, [days]);

  useEffect(() => {
    if (showDetails && detailsScrollRef.current) {
      detailsScrollRef.current.scrollTop = detailsScrollRef.current.scrollHeight;
    }
  }, [details, showDetails]);

  const toggleCuisine = (c: string) => {
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const updateDay = (dayIdx: number, patch: Partial<DayState>) => {
    setDays((prev) => {
      const next = [...prev];
      if (next[dayIdx]) {
        next[dayIdx] = { ...next[dayIdx], ...patch };
      }
      return next;
    });
  };

  const handleGenerate = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setGenerating(true);
    setError("");
    setDetails("");
    detailsRef.current = "";
    setDays(DAYS.map((d) => ({ dayName: d, status: "pending", dishes: [] })));

    try {
      const res = await fetch(`${API_BASE}/menus/generate-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cuisines: cuisines.length > 0 ? cuisines : undefined,
          difficulty,
          cost,
          pantry: pantry ? pantry.split(",").map((s) => s.trim()) : undefined,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No se pudo iniciar la generación");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "day") {
              const idx = data.day - 1;
              if (data.status === "generating") {
                updateDay(idx, { status: "generating", error: undefined });
              } else if (data.status === "saving") {
                updateDay(idx, { status: "saving" });
              } else if (data.status === "done") {
                updateDay(idx, { status: "done", dishes: data.data?.dishes || [] });
              } else if (data.status === "error") {
                updateDay(idx, { status: "error", error: data.error });
              }
            } else if (data.type === "token") {
              detailsRef.current += data.content;
              setDetails(detailsRef.current);
            } else if (data.type === "result") {
              queryClient.invalidateQueries({ queryKey: ["menus"] });
              onClose();
              return;
            } else if (data.type === "error") {
              setError(data.content);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al generar el menú");
      console.error("Error generating menu:", err);
    } finally {
      setGenerating(false);
      generatingRef.current = false;
    }
  }, [name, cuisines, difficulty, cost, pantry, queryClient, onClose]);

  if (!open) return null;

  const doneCount = days.filter((d) => d.status === "done").length;
  const errorDays = days.filter((d) => d.status === "error");
  const hasError = !!error || errorDays.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {step === "name" ? "Nuevo Menú" : generating ? `Generando... ${doneCount}/7` : "Opciones de generación"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={generating}>
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
            {!generating ? (
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
                  <label className="text-sm font-medium text-gray-700 block mb-2">Costo</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  >
                    {costs.map((c) => (
                      <option key={c} value={c}>{costLabels[c]}</option>
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
            ) : null}

            {generating && (
              <div className="mb-4">
                <div
                  ref={progressRef}
                  className="bg-gray-50 border rounded-lg p-3 max-h-64 overflow-y-auto"
                >
                  {days.map((d, i) => (
                    <div key={i} className={`flex items-center gap-2 py-1 text-sm ${d.status === "generating" ? "bg-amber-50 -mx-3 px-3 rounded" : ""}`}>
                      {d.status === "done" && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                      {d.status === "saving" && <Save size={14} className="text-blue-500 shrink-0 animate-pulse" />}
                      {d.status === "generating" && <Loader2 size={14} className="text-amber-500 shrink-0 animate-spin" />}
                      {d.status === "error" && <XCircle size={16} className="text-red-500 shrink-0" />}
                      {d.status === "pending" && <Circle size={14} className="text-gray-300 shrink-0" />}

                      <span className={d.status === "done" ? "text-green-800 font-medium" : "text-gray-700"}>
                        {d.dayName}
                      </span>

                      {d.status === "generating" && (
                        <span className="text-amber-600 text-xs ml-auto">Generando...</span>
                      )}
                      {d.status === "saving" && (
                        <span className="text-blue-600 text-xs ml-auto">Guardando...</span>
                      )}
                      {d.status === "done" && d.dishes.length > 0 && (
                        <span className="text-green-600 text-xs ml-auto truncate max-w-[140px]">
                          {d.dishes[0]}{d.dishes.length > 1 ? ` +${d.dishes.length - 1}` : ""}
                        </span>
                      )}
                      {d.status === "error" && (
                        <span className="text-red-600 text-xs ml-auto truncate max-w-[140px]" title={d.error}>
                          {d.error || "Error"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 text-xs text-gray-500 mt-2 hover:text-gray-700"
                >
                  {showDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {showDetails ? "Ocultar detalles" : "Ver detalles"}
                </button>

                {showDetails && (
                  <div
                    ref={detailsScrollRef}
                    className="bg-gray-50 border rounded-lg p-3 mt-1 max-h-32 overflow-y-auto text-xs font-mono whitespace-pre-wrap text-gray-600"
                  >
                    {details || "Iniciando..."}
                  </div>
                )}
              </div>
            )}

            {hasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
                {error}
                {errorDays.map((d) => (
                  d.error && <div key={d.dayName}>· {d.dayName}: {d.error}</div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              {generating && (
                <img
                  src="/cinnamo_pensando.png"
                  alt="Cinnamoroll pensando"
                  className="h-16 w-auto animate-bounce"
                />
              )}
              <div className="flex gap-2 ml-auto">
                {!generating && (
                  <button
                    onClick={() => setStep("name")}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Atrás
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-40 flex items-center gap-2"
                >
                  {generating ? (
                    <><span className="animate-pulse">●</span> Generando {doneCount}/7</>
                  ) : (
                    "Generar con IA"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
