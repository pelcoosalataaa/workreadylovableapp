import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { bjudInAnstalld, taBortAnstalld } from "@/lib/anstallda.functions";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/anstallda")({ component: Anstallda });

type Rad = { id: string; namn: string; epost: string; bolag: string | null; klarade: string[] };

function Anstallda() {
  const { loading, user, profil } = useAuth();
  const navigate = useNavigate();
  const bjud = useServerFn(bjudInAnstalld);
  const [oppen, setOppen] = useState(false);
  const [form, setForm] = useState<{ namn: string; epost: string; typ: "egen" | "inhyrd"; bolag: string }>({ namn: "", epost: "", typ: "egen", bolag: "" });
  const [skickar, setSkickar] = useState(false);
  const [lista, setLista] = useState<Rad[]>([]);

  const ladda = async () => {
    if (!profil) return;
    const { data: anst } = await supabase
      .from("anvandare")
      .select("id,namn,epost,bolag")
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
    setLista(anst.map((a) => ({ ...a, bolag: a.bolag ?? null, klarade: titlar.get(a.id) ?? [] })));
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
      await bjud({
        data: {
          namn: form.namn,
          epost: form.epost,
          typ: form.typ,
          bolag: form.typ === "inhyrd" ? form.bolag : undefined,
        },
      });
      toast.success("Inbjudan skickad!");
      setOppen(false);
      setForm({ namn: "", epost: "", typ: "egen", bolag: "" });
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
                  <Label>Bolag</Label>
                  <Select value={form.typ} onValueChange={(v) => setForm({ ...form, typ: v as "egen" | "inhyrd" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="egen">Egen anställd</SelectItem>
                      <SelectItem value="inhyrd">Inhyrd personal</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.typ === "inhyrd" && (
                    <Input
                      className="mt-2"
                      placeholder="Vilket bolag?"
                      required
                      value={form.bolag}
                      onChange={(e) => setForm({ ...form, bolag: e.target.value })}
                    />
                  )}
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
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium">{a.namn}</div>
                      <div className="text-xs text-muted-foreground">{a.epost}</div>
                      {a.bolag && <div className="text-xs text-muted-foreground">Bolag: {a.bolag}</div>}
                    </div>
                    <span className="shrink-0 text-sm font-medium text-primary">{a.klarade.length} klarade</span>
                  </div>
                  {a.klarade.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-muted-foreground">Klarade kurser:</div>
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {a.klarade.map((titel, i) => (
                          <li key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                            ✅ {titel}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}

            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
