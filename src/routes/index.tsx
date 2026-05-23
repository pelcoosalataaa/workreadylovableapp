import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const navigate = useNavigate();
  const { loading, user, profil } = useAuth();
  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (profil?.roll === "chef") navigate({ to: "/dashboard" });
    else navigate({ to: "/kurser" });
  }, [loading, user, profil, navigate]);
  return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Laddar…</div>;
}
