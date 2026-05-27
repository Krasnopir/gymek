import { env } from "../env.js";

type ChatMessage = { role: "system" | "user"; content: string };

export async function openaiJsonCompletion<T>(messages: ChatMessage[]): Promise<T> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${text}`);
  }

  const json = (await response.json()) as {
    choices: Array<{ message: { content: string | null } }>;
  };

  const content = json.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  return JSON.parse(content) as T;
}
