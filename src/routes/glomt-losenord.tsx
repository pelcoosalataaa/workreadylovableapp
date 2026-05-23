import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/glomt-losenord")({ component: GlomtLosenord });

function GlomtLosenord() {
  const [epost, setEpost] = useState("");
  const [laddar, setLaddar] = useState(false);
  const [skickat, setSkickat] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLaddar(true);
    const { error } = await supabase.auth.resetPasswordForEmail(epost, {
      redirectTo: `${window.location.origin}/aterstall-losenord`,
    });
    setLaddar(false);
    if (error) return toast.error(error.message);
    setSkickat(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="card-shadow w-full max-w-md rounded-2xl bg-card p-8">
        <h1 className="mb-2 text-3xl font-bold text-primary">Glömt lösenord</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Ange din e-post så skickar vi en återställningslänk.
        </p>
        {skickat ? (
          <div className="space-y-4">
            <p className="text-sm">
              Om kontot finns har vi skickat en återställningslänk till <strong>{epost}</strong>.
              Kontrollera din inkorg.
            </p>
            <Button asChild className="w-full"><Link to="/login">Tillbaka till inloggning</Link></Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="e">E-post</Label>
              <Input id="e" type="email" required value={epost} onChange={(e) => setEpost(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={laddar}>
              {laddar ? "Skickar…" : "Skicka återställningslänk"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-semibold text-primary hover:underline">Tillbaka till inloggning</Link>
        </p>
      </div>
    </div>
  );
}
