import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const inputSchema = z.object({
  kursnamn: z.string().min(1).max(200),
  storage_path: z.string().min(1).max(500),
});

export const skapaKursMedAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("Saknar LOVABLE_API_KEY");

    const { data: signed, error: sErr } = await supabase
      .storage.from("kurser").createSignedUrl(data.storage_path, 600);
    if (sErr || !signed) throw new Error("Kunde inte läsa video: " + sErr?.message);

    const videoRes = await fetch(signed.signedUrl);
    if (!videoRes.ok) throw new Error("Videohämtning misslyckades");
    const videoBlob = await videoRes.blob();

    const fd = new FormData();
    fd.append("file", videoBlob, "video.mp4");
    fd.append("model", "whisper-1");
    fd.append("language", "sv");

    const whisperRes = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Lovable-API-Key": LOVABLE_API_KEY },
      body: fd,
    });
    if (!whisperRes.ok) {
      const txt = await whisperRes.text();
      throw new Error("Whisper: " + whisperRes.status + " " + txt.slice(0, 200));
    }
    const whisperJson = await whisperRes.json() as { text: string };
    const transkription = whisperJson.text ?? "";

    const prompt = `Skapa en e-kurs baserat på denna transkription. Svara ENDAST i JSON: { "titel": string, "steg": [6 strängar], "quiz": [{ "fraga": string, "alternativ": [4 strängar], "ratt_svar": 0-3 }] (8 frågor) }. På svenska.\n\nTranskription:\n${transkription.slice(0, 8000)}`;

    const gptRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "Du skapar tydliga e-kurser på svenska och svarar enbart med giltig JSON." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!gptRes.ok) {
      const txt = await gptRes.text();
      throw new Error("GPT: " + gptRes.status + " " + txt.slice(0, 200));
    }
    const gptJson = await gptRes.json();
    const content = gptJson.choices?.[0]?.message?.content ?? "{}";
    let kurs: { titel: string; steg: string[]; quiz: Array<{ fraga: string; alternativ: string[]; ratt_svar: number }> };
    try {
      kurs = JSON.parse(content);
    } catch {
      throw new Error("Ogiltigt JSON-svar från AI");
    }

    const { data: rad, error: iErr } = await supabase.from("kurser").insert({
      foretag_id: userId,
      titel: data.kursnamn || kurs.titel,
      steg: kurs.steg as unknown as never,
      quiz: kurs.quiz as unknown as never,
      transkription,
    }).select("id").single();
    if (iErr) throw new Error("Kunde inte spara kurs: " + iErr.message);

    return { kurs_id: rad.id };
  });
