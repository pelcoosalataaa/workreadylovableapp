import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({
  userId: z.string().uuid(),
  foretagNamn: z.string().trim().min(1).max(100),
  namn: z.string().trim().min(1).max(100),
  epost: z.string().trim().email().max(255),
});

export const skapaForetagsChef = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { data: userRes, error: uErr } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    if (uErr || !userRes?.user) throw new Error("Användaren hittades inte.");
    if (userRes.user.email?.toLowerCase() !== data.epost.toLowerCase()) {
      throw new Error("E-post matchar inte användaren.");
    }

    const { data: befintlig } = await supabaseAdmin
      .from("anvandare").select("id").eq("id", data.userId).maybeSingle();
    if (befintlig) return { ok: true };

    const { error: iErr } = await supabaseAdmin.from("anvandare").insert({
      id: data.userId,
      foretag_id: data.userId,
      foretag_namn: data.foretagNamn,
      namn: data.namn,
      epost: data.epost,
      roll: "chef",
    });
    if (iErr) throw new Error(iErr.message);
    return { ok: true };
  });
