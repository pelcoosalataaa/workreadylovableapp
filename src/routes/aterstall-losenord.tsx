import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/aterstall-losenord")({ component: AterstallLosenord });

function AterstallLosenord() {
  const navigate = useNavigate();
  const [losen, setLosen] = useState("");
  const [losen2, setLosen2] = useState("");
  const [laddar, setLaddar] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (losen.length < 6) return toast.error("Lösenordet måste vara minst 6 tecken");
    if (losen !== losen2) return toast.error("Lösenorden matchar inte");
    setLaddar(true);
    const { error } = await supabase.auth.updateUser({ password: losen });
    setLaddar(false);
    if (error) return toast.error(error.message);
    toast.success("Lösenord uppdaterat");
    navigate({ to: "/kurser" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="card-shadow w-full max-w-md rounded-2xl bg-card p-8">
        <h1 className="mb-2 text-3xl font-bold text-primary">Nytt lösenord</h1>
        <p className="mb-6 text-sm text-muted-foreground">Välj ett nytt lösenord för ditt konto.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="p1">Nytt lösenord</Label>
            <Input id="p1" type="password" required value={losen} onChange={(e) => setLosen(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p2">Bekräfta lösenord</Label>
            <Input id="p2" type="password" required value={losen2} onChange={(e) => setLosen2(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={laddar}>
            {laddar ? "Sparar…" : "Spara nytt lösenord"}
          </Button>
        </form>
      </div>
    </div>
  );
}
