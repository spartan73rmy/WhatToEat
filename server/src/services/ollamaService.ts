class OllamaService {
  private baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  private model = process.env.OLLAMA_MODEL || "qwen2.5:3b";

  async chat(prompt: string, systemPrompt: string): Promise<string> {
    const url = `${this.baseUrl}/api/chat`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: false,
        format: "json",
        keep_alive: "30m",
        options: { temperature: 0.5, repeat_penalty: 1.1 },
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as { message: { content: string } };
    return data.message.content;
  }

  async warmup(): Promise<void> {
    const url = `${this.baseUrl}/api/generate`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.model, prompt: "hola", stream: false, keep_alive: "30m" }),
        signal: AbortSignal.timeout(120_000),
      });
      if (res.ok) console.log(`Modelo ${this.model} cargado en memoria`);
    } catch (err) {
      console.warn(`No se pudo pre-cargar ${this.model} (se cargará bajo demanda):`, (err as Error).message);
    }
  }

  async *chatStream(
    prompt: string,
    systemPrompt: string,
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(new DOMException("Tiempo de espera agotado", "TimeoutError")),
      600_000
    );

    if (signal) {
      signal.addEventListener("abort", () => controller.abort(signal.reason));
    }

    try {
      const url = `${this.baseUrl}/api/chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          stream: true,
          format: "json",
          keep_alive: "30m",
          options: { temperature: 0.5, repeat_penalty: 1.1 },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No se pudo leer el stream de Ollama");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              yield parsed.message.content;
            }
            if (parsed.done) break;
          } catch {
            // skip malformed NDJSON lines
          }
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const ollamaService = new OllamaService();
