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
import { Upload, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { loading, user, profil } = useAuth();
  const navigate = useNavigate();
  const raderaFn = useServerFn(taBortKurs);
  const [stats, setStats] = useState({ kurser: 0, anstallda: 0, godkanda: 0 });
  const [senaste, setSenaste] = useState<Array<{ id: string; titel: string; skapad_at: string }>>([]);
  const [raderar, setRaderar] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return void navigate({ to: "/login" });
    if (profil && profil.roll !== "chef") return void navigate({ to: "/kurser" });
    if (!profil) return;
    (async () => {
      const [k, a, r] = await Promise.all([
        supabase.from("kurser").select("id,titel,skapad_at").order("skapad_at", { ascending: false }),
        supabase.from("anvandare").select("id", { count: "exact", head: true }).eq("foretag_id", profil.foretag_id).eq("roll", "anstalld"),
        supabase.from("resultat").select("id, kurser!inner(foretag_id)", { count: "exact", head: true }).eq("godkand", true).eq("kurser.foretag_id", profil.foretag_id),
      ]);
      setStats({
        kurser: k.data?.length ?? 0,
        anstallda: a.count ?? 0,
        godkanda: r.count ?? 0,
      });
      setSenaste((k.data ?? []).slice(0, 5));
    })();
  }, [loading, user, profil, navigate]);

  if (loading || !profil) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Laddar…</div>;

  const radera = async (id: string) => {
    try {
      setRaderar(id);
      await raderaFn({ data: { kurs_id: id } });
      toast.success("Kursen är borttagen");
      setSenaste((l) => l.filter((k) => k.id !== id));
      setStats((s) => ({ ...s, kurser: Math.max(0, s.kurser - 1) }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunde inte radera");
    } finally {
      setRaderar(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <h1 className="text-3xl font-bold text-primary">Hej {profil.namn}!</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Kurser skapade" value={stats.kurser} />
          <Stat label="Anställda" value={stats.anstallda} />
          <Stat label="Godkända" value={stats.godkanda} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/ladda-upp" className="card-shadow flex items-center gap-4 rounded-2xl bg-primary p-6 text-primary-foreground transition hover:opacity-95">
            <Upload className="h-8 w-8" />
            <div>
              <div className="text-lg font-semibold">Skapa kurs</div>
              <div className="text-sm opacity-80">Ladda upp video eller dokument</div>
            </div>
          </Link>

          <Link to="/anstallda" className="card-shadow flex items-center gap-4 rounded-2xl bg-card p-6 text-primary transition hover:bg-accent">
            <UserPlus className="h-8 w-8" />
            <div>
              <div className="text-lg font-semibold">Bjud in anställd</div>
              <div className="text-sm text-muted-foreground">Hantera ditt team</div>
            </div>
          </Link>
        </div>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-primary">Senaste kurser</h2>
          <div className="card-shadow rounded-2xl bg-card p-2">
            {senaste.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Inga kurser än.</p>
            ) : (
              <ul className="divide-y divide-border">
                {senaste.map((k) => (
                  <li key={k.id} className="flex items-center justify-between px-4 py-3">
                    <span className="font-medium">{k.titel}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(k.skapad_at).toLocaleDateString("sv-SE")}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={raderar === k.id} aria-label="Ta bort kurs">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ta bort kursen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{k.titel}" och alla resultat för kursen tas bort permanent.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Avbryt</AlertDialogCancel>
                            <AlertDialogAction onClick={() => radera(k.id)}>Ta bort</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div>
          <Button asChild variant="outline">
            <Link to="/anstallda">Visa anställda</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-shadow rounded-2xl bg-card p-6">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-bold text-primary">{value}</div>
    </div>
  );
}
