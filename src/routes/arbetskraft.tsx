import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell, LightPlaceholderCard } from "@/components/LightAppShell";

export const Route = createFileRoute("/arbetskraft")({
  component: ArbetskraftPage,
});

function ArbetskraftPage() {
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
    <LightAppShell title="Arbetskraft">
      <LightPlaceholderCard
        heading="Arbetskraft"
        description="Här samlas all egen och inhyrd personal — status, avdelning och beredskap. Den fullständiga vyn är under uppbyggnad. Under tiden hittar du listorna i de befintliga vyerna nedan."
        legacyHref="/personal"
        legacyLabel="Öppna personal"
      />
      <LightPlaceholderCard
        heading="Inhyrd personal"
        description="Inhyrda arbetare från bemanningspartners listas separat i den klassiska vyn."
        legacyHref="/inhyrd-personal"
        legacyLabel="Öppna inhyrd personal"
      />
    </LightAppShell>
  );
}
