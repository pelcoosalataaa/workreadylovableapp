import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell, LightPlaceholderCard } from "@/components/LightAppShell";

export const Route = createFileRoute("/utbildning")({
  component: UtbildningPage,
});

function UtbildningPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

  return (
    <LightAppShell title="Utbildning & Onboarding">
      <LightPlaceholderCard
        heading="Moduler"
        description="Alla AI-genererade utbildningsmoduler. Här ser du status, antal klara och kan skapa nya."
        legacyHref="/moduler"
        legacyLabel="Öppna moduler"
      />
      <LightPlaceholderCard
        heading="Spela in ny modul"
        description="Spela in en kort video, så bygger AI:n ett komplett utbildningssteg åt dig."
        legacyHref="/spela-in"
        legacyLabel="Spela in"
      />
    </LightAppShell>
  );
}
