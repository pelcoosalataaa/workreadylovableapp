import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell, LightPlaceholderCard } from "@/components/LightAppShell";

export const Route = createFileRoute("/bemanningspartners")({
  component: BemanningspartnersPage,
});

function BemanningspartnersPage() {
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
    <LightAppShell title="Bemanningspartners">
      <LightPlaceholderCard
        heading="Bemanningspartners"
        description="Översikt över alla bemanningsbolag du samarbetar med, inhyrd personal och avtal."
        legacyHref="/bemanningsbolag"
        legacyLabel="Öppna bemanningsbolag"
      />
    </LightAppShell>
  );
}
