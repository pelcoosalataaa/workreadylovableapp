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

export const taBortAnstalld = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ anvandare_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: chef } = await supabase
      .from("anvandare").select("foretag_id, roll").eq("id", userId).maybeSingle();
    if (!chef || chef.roll !== "chef") throw new Error("Endast chefer kan ta bort anställda.");

    const { data: mal } = await supabase
      .from("anvandare").select("id, foretag_id, roll").eq("id", data.anvandare_id).maybeSingle();
    if (!mal) throw new Error("Användaren hittades inte.");
    if (mal.foretag_id !== chef.foretag_id) throw new Error("Användaren tillhör inte ditt företag.");
    if (mal.roll !== "anstalld") throw new Error("Endast anställda kan tas bort.");

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    await admin.from("resultat").delete().eq("anvandare_id", data.anvandare_id);
    const { error: pErr } = await admin.from("anvandare").delete().eq("id", data.anvandare_id);
    if (pErr) throw new Error("Kunde inte ta bort användare: " + pErr.message);
    const { error: aErr } = await admin.auth.admin.deleteUser(data.anvandare_id);
    if (aErr) throw new Error("Kunde inte ta bort konto: " + aErr.message);

    return { ok: true };
  });
