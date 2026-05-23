import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
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
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) throw new Error("Saknar OPENAI_API_KEY");

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

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
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
        model: "google/gemini-3-flash-preview",
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

    const quizUtanFacit = kurs.quiz.map((q) => ({ fraga: q.fraga, alternativ: q.alternativ }));
    const rattSvar = kurs.quiz.map((q) => q.ratt_svar);

    const { data: rad, error: iErr } = await supabase.from("kurser").insert({
      foretag_id: userId,
      chef_id: userId,
      titel: data.kursnamn || kurs.titel,
      steg: kurs.steg as unknown as never,
      quiz: quizUtanFacit as unknown as never,
      transkription,
    }).select("id").single();
    if (iErr) throw new Error("Kunde inte spara kurs: " + iErr.message);

    const { error: fErr } = await supabaseAdmin.from("kurs_facit").insert({
      kurs_id: rad.id,
      ratt_svar: rattSvar,
    });
    if (fErr) throw new Error("Kunde inte spara facit: " + fErr.message);

    return { kurs_id: rad.id };
  });

// --- Hämta kurs utan facit (rätt svar exponeras aldrig till klienten) ---
export const hamtaKursForVisning = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ kurs_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: kurs, error } = await supabase
      .from("kurser")
      .select("id, titel, steg, quiz")
      .eq("id", data.kurs_id)
      .maybeSingle();
    if (error || !kurs) throw new Error("Kurs hittades inte");
    const quiz = (kurs.quiz as unknown as Array<{ fraga: string; alternativ: string[]; ratt_svar: number }>)
      .map((q) => ({ fraga: q.fraga, alternativ: q.alternativ }));
    return {
      id: kurs.id,
      titel: kurs.titel,
      steg: kurs.steg as unknown as string[],
      quiz,
    };
  });

// --- Kontrollera ett enskilt svar (server-side facit) ---
export const kontrolleraSvar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      kurs_id: z.string().uuid(),
      fraga_idx: z.number().int().min(0).max(50),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // Confirm caller has access to this course (RLS on kurser scopes by company)
    const { data: kurs, error } = await supabase
      .from("kurser").select("id").eq("id", data.kurs_id).maybeSingle();
    if (error || !kurs) throw new Error("Kurs hittades inte");
    const { data: facit, error: fErr } = await supabaseAdmin
      .from("kurs_facit").select("ratt_svar").eq("kurs_id", data.kurs_id).maybeSingle();
    if (fErr || !facit) throw new Error("Facit saknas");
    if (data.fraga_idx >= facit.ratt_svar.length) throw new Error("Ogiltig fråga");
    return { ratt_svar: facit.ratt_svar[data.fraga_idx] };
  });

// --- Lämna in quiz: rättning sker på servern ---
export const lamnaInQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      kurs_id: z.string().uuid(),
      svar: z.array(z.number().int().min(0).max(10)).min(1).max(20),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: kurs, error } = await supabase
      .from("kurser").select("id").eq("id", data.kurs_id).maybeSingle();
    if (error || !kurs) throw new Error("Kurs hittades inte");

    const { data: facit, error: fErr } = await supabaseAdmin
      .from("kurs_facit").select("ratt_svar").eq("kurs_id", data.kurs_id).maybeSingle();
    if (fErr || !facit) throw new Error("Facit saknas");
    const rattSvar = facit.ratt_svar;
    if (data.svar.length !== rattSvar.length) throw new Error("Felaktigt antal svar");

    let poang = 0;
    for (let i = 0; i < rattSvar.length; i++) {
      if (data.svar[i] === rattSvar[i]) poang++;
    }
    const godkand = poang >= 6;

    if (godkand) {
      const { data: redan } = await supabaseAdmin
        .from("resultat")
        .select("id")
        .eq("kurs_id", kurs.id)
        .eq("anvandare_id", userId)
        .eq("godkand", true)
        .maybeSingle();
      if (!redan) {
        await supabaseAdmin.from("resultat").insert({
          kurs_id: kurs.id,
          anvandare_id: userId,
          godkand,
          poang,
        });
      }
    }

    return { poang, antal: rattSvar.length, godkand };
  });

// --- Skapa kurs från dokument (PDF/TXT/MD) ---
const dokSchema = z.object({
  kursnamn: z.string().min(1).max(200),
  storage_path: z.string().min(1).max(500),
  mime: z.string().min(1).max(100),
});

export const skapaKursMedDokument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => dokSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("Saknar LOVABLE_API_KEY");

    const { data: signed, error: sErr } = await supabase
      .storage.from("kurser").createSignedUrl(data.storage_path, 600);
    if (sErr || !signed) throw new Error("Kunde inte läsa dokument: " + sErr?.message);

    const fileRes = await fetch(signed.signedUrl);
    if (!fileRes.ok) throw new Error("Filhämtning misslyckades");

    const isPdf = data.mime.includes("pdf");
    const isText = data.mime.startsWith("text/") || /\.(txt|md)$/i.test(data.storage_path);

    const promptIntro = `Skapa en e-kurs baserat på dokumentet. Svara ENDAST i JSON: { "titel": string, "steg": [6 strängar som sammanfattar viktiga punkter ur dokumentet], "quiz": [{ "fraga": string, "alternativ": [4 strängar], "ratt_svar": 0-3 }] (8 frågor). På svenska.`;

    let messages: Array<{ role: string; content: unknown }>;
    if (isText) {
      const txt = await fileRes.text();
      messages = [
        { role: "system", content: "Du skapar tydliga e-kurser på svenska och svarar enbart med giltig JSON." },
        { role: "user", content: `${promptIntro}\n\nDokumenttext:\n${txt.slice(0, 15000)}` },
      ];
    } else if (isPdf) {
      const buf = await fileRes.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      messages = [
        { role: "system", content: "Du skapar tydliga e-kurser på svenska och svarar enbart med giltig JSON." },
        {
          role: "user",
          content: [
            { type: "text", text: promptIntro },
            { type: "image_url", image_url: { url: `data:application/pdf;base64,${b64}` } },
          ],
        },
      ];
    } else {
      throw new Error("Filtyp stöds ej. Ladda upp PDF, TXT eller MD.");
    }

    const gptRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
      }),
    });
    if (!gptRes.ok) {
      const txt = await gptRes.text();
      throw new Error("AI: " + gptRes.status + " " + txt.slice(0, 200));
    }
    const gptJson = await gptRes.json();
    const content = gptJson.choices?.[0]?.message?.content ?? "{}";
    let kurs: { titel: string; steg: string[]; quiz: Array<{ fraga: string; alternativ: string[]; ratt_svar: number }> };
    try {
      kurs = JSON.parse(content);
    } catch {
      throw new Error("Ogiltigt JSON-svar från AI");
    }

    const quizUtanFacit = kurs.quiz.map((q) => ({ fraga: q.fraga, alternativ: q.alternativ }));
    const rattSvar = kurs.quiz.map((q) => q.ratt_svar);

    const { data: rad, error: iErr } = await supabase.from("kurser").insert({
      foretag_id: userId,
      chef_id: userId,
      titel: data.kursnamn || kurs.titel,
      steg: kurs.steg as unknown as never,
      quiz: quizUtanFacit as unknown as never,
    }).select("id").single();
    if (iErr) throw new Error("Kunde inte spara kurs: " + iErr.message);

    const { error: fErr } = await supabaseAdmin.from("kurs_facit").insert({
      kurs_id: rad.id,
      ratt_svar: rattSvar,
    });
    if (fErr) throw new Error("Kunde inte spara facit: " + fErr.message);

    return { kurs_id: rad.id };
  });
