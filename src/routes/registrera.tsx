import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/registrera")({ component: Registrera });

function Registrera() {
  const navigate = useNavigate();
  const { laddaProfil } = useAuth();
  const [form, setForm] = useState({ foretag: "", namn: "", epost: "", losen: "" });
  const [laddar, setLaddar] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLaddar(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.epost,
      password: form.losen,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error || !data.user) {
      setLaddar(false);
      return toast.error(error?.message ?? "Kunde inte skapa konto");
    }
    const uid = data.user.id;
    const { error: pErr } = await supabase.from("anvandare").insert({
      id: uid,
      foretag_id: uid,
      foretag_namn: form.foretag,
      namn: form.namn,
      epost: form.epost,
      roll: "chef",
    });
    setLaddar(false);
    if (pErr) return toast.error(pErr.message);
    if (!data.session) {
      toast.success("✅ Kolla din e-post och klicka på länken för att aktivera ditt konto.");
      return;
    }
    await laddaProfil();
    toast.success("Konto skapat!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="card-shadow w-full max-w-md rounded-2xl bg-card p-8">
        <h1 className="mb-2 text-3xl font-bold text-primary">Skapa konto</h1>
        <p className="mb-6 text-sm text-muted-foreground">Som chef för ditt företag</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Företagsnamn</Label>
            <Input required value={form.foretag} onChange={(e) => setForm({ ...form, foretag: e.target.value })} />
          </div>
          <div>
            <Label>Namn</Label>
            <Input required value={form.namn} onChange={(e) => setForm({ ...form, namn: e.target.value })} />
          </div>
          <div>
            <Label>E-post</Label>
            <Input type="email" required value={form.epost} onChange={(e) => setForm({ ...form, epost: e.target.value })} />
          </div>
          <div>
            <Label>Lösenord</Label>
            <Input type="password" required minLength={6} value={form.losen} onChange={(e) => setForm({ ...form, losen: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={laddar}>
            {laddar ? "Skapar…" : "Skapa konto"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Har du redan ett konto? <Link to="/login" className="font-semibold text-primary hover:underline">Logga in</Link>
        </p>
      </div>
    </div>
  );
}
