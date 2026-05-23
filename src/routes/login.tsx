import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [epost, setEpost] = useState("");
  const [losen, setLosen] = useState("");
  const [laddar, setLaddar] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLaddar(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: epost, password: losen });
    setLaddar(false);
    if (error) return toast.error(error.message);
    const uid = data.user.id;
    const { data: profil } = await supabase.from("anvandare").select("roll").eq("id", uid).maybeSingle();
    navigate({ to: profil?.roll === "chef" ? "/dashboard" : "/kurser" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="card-shadow w-full max-w-md rounded-2xl bg-card p-8">
        <h1 className="mb-2 text-3xl font-bold text-primary">Ready2Work</h1>
        <p className="mb-6 text-sm text-muted-foreground">Logga in på ditt konto</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="e">E-post</Label>
            <Input id="e" type="email" required value={epost} onChange={(e) => setEpost(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="l">Lösenord</Label>
            <Input id="l" type="password" required value={losen} onChange={(e) => setLosen(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={laddar}>
            {laddar ? "Loggar in…" : "Logga in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/glomt-losenord" className="text-muted-foreground hover:text-primary hover:underline">
            Glömt lösenord?
          </Link>
        </p>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ny här? <Link to="/registrera" className="font-semibold text-primary hover:underline">Skapa konto</Link>
        </p>
      </div>
    </div>
  );
}
