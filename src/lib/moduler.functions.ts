import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  videoPath: z.string().min(1).max(500),
  kategori: z.string().min(1).max(100),
  moment: z.string().min(1).max(100),
});

type GeneratedModule = {
  titel: string;
  steg: string[];
  quiz: { fraga: string; alternativ: string[]; ratt_svar: number }[];
};

export const processModuleVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) throw new Error("OPENAI_API_KEY is not configured");

    // 1. Download video from storage
    const { data: file, error: dlErr } = await supabase.storage
      .from("moduler")
      .download(data.videoPath);
    if (dlErr || !file) {
      throw new Error("download_failed: " + (dlErr?.message ?? "no file"));
    }

    // 2. Whisper transcription
    const form = new FormData();
    const filename = data.videoPath.split("/").pop() ?? "video.mp4";
    form.append("file", file, filename);
    form.append("model", "whisper-1");
    form.append("language", "sv");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: form,
    });
    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      throw new Error(`transcription_failed: ${whisperRes.status} ${errText}`);
    }
    const whisperJson = (await whisperRes.json()) as { text: string };
    const transkription = whisperJson.text ?? "";

    // 3. GPT-4o generation
    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Du är en expert på att skapa industriella utbildningsmoduler på svenska. Baserat på transkriptionen, skapa: 1) En titel för modulen, 2) 5 steg-för-steg instruktioner, 3) 4 quiz-frågor med 4 svarsalternativ vardera där ett är rätt. Svara ENDAST i JSON format.",
          },
          {
            role: "user",
            content: `Moment: ${data.moment}\nKategori: ${data.kategori}\n\nTranskription:\n${transkription}\n\nReturnera JSON enligt:\n{\n  "titel": "string",\n  "steg": ["string","string","string","string","string"],\n  "quiz": [ { "fraga":"string","alternativ":["string","string","string","string"],"ratt_svar":0 } ]\n}`,
          },
        ],
      }),
    });
    if (!gptRes.ok) {
      const errText = await gptRes.text();
      throw new Error(`generation_failed: ${gptRes.status} ${errText}`);
    }
    const gptJson = (await gptRes.json()) as {
      choices: { message: { content: string } }[];
    };
    let parsed: GeneratedModule;
    try {
      parsed = JSON.parse(gptJson.choices[0]?.message?.content ?? "{}");
    } catch {
      throw new Error("generation_failed: invalid JSON");
    }

    // 4. Save module
    const { data: inserted, error: insErr } = await supabase
      .from("moduler")
      .insert({
        titel: parsed.titel,
        steg: parsed.steg,
        quiz: parsed.quiz,
        transkription,
        skapad_av: userId,
        kategori: data.kategori,
      })
      .select()
      .single();
    if (insErr) throw new Error("save_failed: " + insErr.message);

    return {
      id: inserted.id as string,
      titel: parsed.titel,
      steg: parsed.steg,
      quiz: parsed.quiz,
    };
  });
