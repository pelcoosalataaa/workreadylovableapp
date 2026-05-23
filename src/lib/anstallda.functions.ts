import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const inputSchema = z.object({
  namn: z.string().min(1).max(100),
  epost: z.string().email().max(255),
  typ: z.enum(["egen", "inhyrd"]),
  bolag: z.string().max(150).optional(),
});

export const bjudInAnstalld = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: chef } = await supabase
      .from("anvandare").select("*").eq("id", userId).maybeSingle();
    if (!chef || chef.roll !== "chef") throw new Error("Endast chefer kan bjuda in.");

    const bolag =
      data.typ === "inhyrd"
        ? (data.bolag?.trim() || "Inhyrd personal")
        : chef.foretag_namn;

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: invite, error: iErr } = await admin.auth.admin.inviteUserByEmail(data.epost);
    if (iErr || !invite?.user) throw new Error("Kunde inte bjuda in: " + (iErr?.message ?? ""));

    const { error: pErr } = await admin.from("anvandare").insert({
      id: invite.user.id,
      foretag_id: chef.foretag_id,
      foretag_namn: chef.foretag_namn,
      namn: data.namn,
      epost: data.epost,
      roll: "anstalld",
      bolag,
    });
    if (pErr) throw new Error("Kunde inte spara användare: " + pErr.message);

    return { ok: true };
  });
