import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Logga in — WorkReady" },
      { name: "description", content: "Logga in på WorkReady, Workforce Intelligence Platform av Partner2Work AB." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Felaktig e-postadress eller lösenord.");
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 mint-glow pointer-events-none" />

      <header className="relative z-10 px-8 pt-8">
        <div className="flex flex-col">
          <span className="font-display text-2xl font-bold tracking-tight text-foreground">WorkReady</span>
          <span className="text-xs font-medium text-primary">by Partner2Work AB</span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-180px)] items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-xl border bg-card shadow-2xl"
          style={{ padding: "40px" }}
        >
          <h1 className="font-display text-[28px] font-bold leading-tight text-foreground">Logga in</h1>
          <p className="mt-1 text-xs text-muted-foreground">Workforce Intelligence Platform</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">E-postadress</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="namn@foretag.se"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">Lösenord</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Loggar in..." : "Logga in →"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-xs text-muted-foreground transition hover:text-primary">
                Glömt lösenord?
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="relative z-10 pb-6 text-center text-xs text-muted-foreground">
        Powered by WorkReady · Partner2Work AB
      </footer>
    </div>
  );
}
