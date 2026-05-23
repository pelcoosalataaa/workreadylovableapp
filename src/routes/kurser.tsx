import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { taBortKurs } from "@/lib/kurs.functions";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/kurser")({ component: Kurser });

type Rad = { id: string; titel: string; klar: boolean };

function Kurser() {
  const { loading, user, profil } = useAuth();
  const navigate = useNavigate();
  const raderaFn = useServerFn(taBortKurs);
  const [lista, setLista] = useState<Rad[]>([]);
  const [raderar, setRaderar] = useState<string | null>(null);

  const ladda = async () => {
    if (!user || !profil) return;
    const { data: kurser } = await supabase.from("kurser").select("id,titel").eq("foretag_id", profil.foretag_id).order("skapad_at", { ascending: false });
    const { data: mina } = await supabase.from("resultat").select("kurs_id,godkand").eq("anvandare_id", user.id).eq("godkand", true);
    const klara = new Set(mina?.map((r) => r.kurs_id));
    setLista((kurser ?? []).map((k) => ({ id: k.id, titel: k.titel, klar: klara.has(k.id) })));
  };

  useEffect(() => {
    if (loading) return;
    if (!user) return void navigate({ to: "/login" });
    if (!profil) return;
    void ladda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, profil, navigate]);

  if (loading || !profil) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Laddar…</div>;

  const arChef = profil.roll === "chef";

  const radera = async (id: string) => {
    try {
      setRaderar(id);
      await raderaFn({ data: { kurs_id: id } });
      toast.success("Kursen är borttagen");
      setLista((l) => l.filter((k) => k.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunde inte radera");
    } finally {
      setRaderar(null);
    }
  };

  const attGora = lista.filter((k) => !k.klar);
  const klarade = lista.filter((k) => k.klar);

  const RaderaKnapp = ({ id, titel }: { id: string; titel: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={raderar === id} aria-label="Ta bort kurs">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort kursen?</AlertDialogTitle>
          <AlertDialogDescription>
            "{titel}" och alla resultat för kursen tas bort permanent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction onClick={() => radera(id)}>Ta bort</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

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
                <div className="flex items-center gap-2">
                  <Button asChild>
                    <Link to="/kurs/$id" params={{ id: k.id }}>Starta</Link>
                  </Button>
                  {arChef && <RaderaKnapp id={k.id} titel={k.titel} />}
                </div>
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
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">✅ Klar</span>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/kurs/$id" params={{ id: k.id }} search={{ repetera: 1 }}>Repetera</Link>
                  </Button>
                  {arChef && <RaderaKnapp id={k.id} titel={k.titel} />}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
