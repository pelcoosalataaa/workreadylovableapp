import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/kurser")({ component: Kurser });

type Rad = { id: string; titel: string; klar: boolean };

function Kurser() {
  const { loading, user, profil } = useAuth();
  const navigate = useNavigate();
  const [lista, setLista] = useState<Rad[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) return void navigate({ to: "/login" });
    if (!profil) return;
    (async () => {
      const { data: kurser } = await supabase.from("kurser").select("id,titel").eq("foretag_id", profil.foretag_id).order("skapad_at", { ascending: false });
      const { data: mina } = await supabase.from("resultat").select("kurs_id,godkand").eq("anvandare_id", user.id).eq("godkand", true);
      const klara = new Set(mina?.map((r) => r.kurs_id));
      setLista((kurser ?? []).map((k) => ({ id: k.id, titel: k.titel, klar: klara.has(k.id) })));
    })();
  }, [loading, user, profil, navigate]);

  if (loading || !profil) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Laddar…</div>;

  const attGora = lista.filter((k) => !k.klar);
  const klarade = lista.filter((k) => k.klar);

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <h1 className="text-3xl font-bold text-primary">Mina kurser</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Att göra</h2>
          {attGora.length === 0 ? (
            <p className="text-muted-foreground">Inga kurser att göra just nu.</p>
          ) : (
            attGora.map((k) => (
              <div key={k.id} className="card-shadow flex items-center justify-between rounded-2xl bg-card p-5">
                <span className="font-medium">{k.titel}</span>
                <Button asChild>
                  <Link to="/kurs/$id" params={{ id: k.id }}>Starta</Link>
                </Button>
              </div>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Klarade</h2>
          {klarade.length === 0 ? (
            <p className="text-muted-foreground">Du har inte klarat några kurser ännu.</p>
          ) : (
            klarade.map((k) => (
              <div key={k.id} className="card-shadow flex items-center justify-between rounded-2xl bg-card p-5">
                <span className="font-medium">{k.titel}</span>
                <span className="font-semibold text-primary">✅ Klar</span>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

