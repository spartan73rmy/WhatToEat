import dotenv from "dotenv";
dotenv.config();

export class OpenRouterService {
  private apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4-flash:free";
    if (!this.apiKey) {
      console.warn("OPENROUTER_API_KEY not set");
    }
  }

  async chat(prompt: string, systemPrompt: string): Promise<string> {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter error ${res.status}: ${err}`);
    }

    const data: any = await res.json();
    return data.choices[0].message.content;
  }
}

export const ai = new OpenRouterService();
