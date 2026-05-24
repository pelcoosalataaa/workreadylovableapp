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
  const [fel, setFel] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const hashFel = params.get("error_description") ?? params.get("error");

      if (hashFel) {
        setFel(decodeURIComponent(hashFel));
        return;
      }

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          setFel(error.message);
          return;
        }
        window.history.replaceState(null, "", window.location.pathname);
        setRedo(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) setRedo(true);
      else setFel("Ogiltig eller utgången inbjudningslänk.");
    };
    init();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFel(null);
    if (losen.length < 6) {
      setFel("Lösenordet måste vara minst 6 tecken.");
      return;
    }
    if (losen !== losen2) {
      setFel("Lösenorden matchar inte.");
      return;
    }
    setLaddar(true);
    const { data: userData, error } = await supabase.auth.updateUser({ password: losen });
    if (error) {
      setLaddar(false);
      setFel(error.message);
      return;
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
    toast.success("Kontot är aktiverat");
    navigate({ to: roll === "chef" ? "/dashboard" : "/kurser" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="card-shadow w-full max-w-md rounded-2xl bg-card p-8">
        <h1 className="mb-2 text-3xl font-bold text-primary">Aktivera ditt konto</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Välkommen till WorkReady! Välj ett lösenord för att aktivera ditt konto.
        </p>
        {!redo ? (
          <p className="text-sm text-muted-foreground">
            {fel ?? "Verifierar inbjudningslänk…"}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="p1">Välj lösenord</Label>
              <Input
                id="p1"
                type="password"
                required
                minLength={6}
                value={losen}
                onChange={(e) => setLosen(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="p2">Bekräfta lösenord</Label>
              <Input
                id="p2"
                type="password"
                required
                minLength={6}
                value={losen2}
                onChange={(e) => setLosen2(e.target.value)}
              />
            </div>
            {fel && <p className="text-sm font-medium text-destructive">{fel}</p>}
            <Button
              type="submit"
              className="w-full bg-[#1e3a8a] text-white hover:bg-[#1e40af]"
              disabled={laddar}
            >
              {laddar ? "Aktiverar…" : "Aktivera mitt konto"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
