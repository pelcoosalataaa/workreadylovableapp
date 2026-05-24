import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/set-password")({ component: SetPassword });

function SetPassword() {
  const navigate = useNavigate();
  const [losen, setLosen] = useState("");
  const [losen2, setLosen2] = useState("");
  const [laddar, setLaddar] = useState(false);
  const [redo, setRedo] = useState(false);

  useEffect(() => {
    // Supabase-inbjudningslänk innehåller token i URL-hashen och hanteras
    // automatiskt av supabase-js (detectSessionInUrl). Vi väntar bara på
    // att sessionen blir tillgänglig.
    const kolla = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setRedo(true);
        return;
      }
    };
    kolla();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) setRedo(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (losen.length < 6) return toast.error("Lösenordet måste vara minst 6 tecken");
    if (losen !== losen2) return toast.error("Lösenorden matchar inte");
    setLaddar(true);
    const { data: userData, error } = await supabase.auth.updateUser({ password: losen });
    if (error) {
      setLaddar(false);
      return toast.error(error.message);
    }
    const uid = userData.user?.id;
    let roll: string | null = null;
    if (uid) {
      const { data: profil } = await supabase
        .from("anvandare")
        .select("roll")
        .eq("id", uid)
        .maybeSingle();
      roll = (profil as { roll?: string } | null)?.roll ?? null;
    }
    setLaddar(false);
    toast.success("Lösenord sparat");
    navigate({ to: roll === "chef" ? "/dashboard" : "/kurser" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="card-shadow w-full max-w-md rounded-2xl bg-card p-8">
        <h1 className="mb-2 text-3xl font-bold text-primary">Välj lösenord</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Välkommen! Skapa ett lösenord för att slutföra ditt konto.
        </p>
        {!redo ? (
          <p className="text-sm text-muted-foreground">Verifierar inbjudningslänk…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="p1">Lösenord</Label>
              <Input id="p1" type="password" required value={losen} onChange={(e) => setLosen(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="p2">Bekräfta lösenord</Label>
              <Input id="p2" type="password" required value={losen2} onChange={(e) => setLosen2(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={laddar}>
              {laddar ? "Sparar…" : "Spara lösenord"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
