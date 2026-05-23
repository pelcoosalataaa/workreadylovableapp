import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { bjudInAnstalld } from "@/lib/anstallda.functions";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/anstallda")({ component: Anstallda });

type Rad = { id: string; namn: string; epost: string; klarade: string[] };

function Anstallda() {
  const { loading, user, profil } = useAuth();
  const navigate = useNavigate();
  const bjud = useServerFn(bjudInAnstalld);
  const [oppen, setOppen] = useState(false);
  const [form, setForm] = useState({ namn: "", epost: "" });
  const [skickar, setSkickar] = useState(false);
  const [lista, setLista] = useState<Rad[]>([]);

  const ladda = async () => {
    if (!profil) return;
    const { data: anst } = await supabase
      .from("anvandare")
      .select("id,namn,epost")
      .eq("foretag_id", profil.foretag_id)
      .eq("roll", "anstalld");
    if (!anst) return;
    const { data: res } = await supabase
      .from("resultat")
      .select("anvandare_id, kurser!inner(titel)")
      .eq("godkand", true);
    const titlar = new Map<string, string[]>();
    (res ?? []).forEach((r: { anvandare_id: string; kurser: { titel: string } | { titel: string }[] | null }) => {
      const k = Array.isArray(r.kurser) ? r.kurser[0] : r.kurser;
      if (!k) return;
      const arr = titlar.get(r.anvandare_id) ?? [];
      arr.push(k.titel);
      titlar.set(r.anvandare_id, arr);
    });
    setLista(anst.map((a) => ({ ...a, klarade: titlar.get(a.id) ?? [] })));
  };


  useEffect(() => {
    if (loading) return;
    if (!user) return void navigate({ to: "/login" });
    if (profil && profil.roll !== "chef") return void navigate({ to: "/kurser" });
    ladda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, profil]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSkickar(true);
    try {
      await bjud({ data: form });
      toast.success("Inbjudan skickad!");
      setOppen(false);
      setForm({ namn: "", epost: "" });
      await ladda();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fel");
    } finally {
      setSkickar(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Anställda</h1>
          <Dialog open={oppen} onOpenChange={setOppen}>
            <DialogTrigger asChild>
              <Button>Bjud in anställd</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Bjud in anställd</DialogTitle></DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label>Namn</Label>
                  <Input required value={form.namn} onChange={(e) => setForm({ ...form, namn: e.target.value })} />
                </div>
                <div>
                  <Label>E-post</Label>
                  <Input type="email" required value={form.epost} onChange={(e) => setForm({ ...form, epost: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={skickar}>
                  {skickar ? "Skickar…" : "Skicka inbjudan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="card-shadow rounded-2xl bg-card p-2">
          {lista.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Inga anställda än.</p>
          ) : (
            <ul className="divide-y divide-border">
              {lista.map((a) => (
                <li key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-medium">{a.namn}</div>
                    <div className="text-xs text-muted-foreground">{a.epost}</div>
                  </div>
                  <span className="text-sm text-muted-foreground">{a.klarade} klarade</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
