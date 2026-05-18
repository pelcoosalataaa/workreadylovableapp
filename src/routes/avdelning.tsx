import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";
import { DEPARTMENTS, STORAGE_KEY, type DepartmentValue } from "@/lib/departments";

export const Route = createFileRoute("/avdelning")({
  component: AvdelningPage,
});

function AvdelningPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<DepartmentValue | null>(null);

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

  if (!ready) return <div className="min-h-screen bg-background" />;

  const confirm = () => {
    if (!selected) return;
    localStorage.setItem(STORAGE_KEY, selected);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#060f18", color: "#edfaf4" }}>
      <header className="px-8 pt-8 flex items-center gap-2">
        <span className="font-display font-bold text-[20px]">WorkReady</span>
        <span className="text-[12px]" style={{ color: "#7dedb8" }}>by Partner2Work AB</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div
          className="w-full"
          style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 12, padding: 40, maxWidth: 600 }}
        >
          <h1 className="font-display font-bold" style={{ color: "#fff", fontSize: 24, fontFamily: "Syne, sans-serif" }}>
            Välj din avdelning
          </h1>
          <p className="mt-1" style={{ color: "#8ec8e0", fontSize: 13 }}>
            Byggelement AB · Ucklum · Välj den avdelning där du arbetar
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {DEPARTMENTS.map((d) => {
              const isSel = selected === d.value;
              const Icon = d.icon;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelected(d.value)}
                  className="relative text-left transition-colors"
                  style={{
                    background: isSel ? "rgba(125,237,184,0.08)" : "#0b1e2d",
                    border: `1px solid ${isSel ? "#7dedb8" : "#1a3d58"}`,
                    borderRadius: 10,
                    padding: 20,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (isSel) return;
                    e.currentTarget.style.borderColor = "#7dedb8";
                    e.currentTarget.style.background = "rgba(125,237,184,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (isSel) return;
                    e.currentTarget.style.borderColor = "#1a3d58";
                    e.currentTarget.style.background = "#0b1e2d";
                  }}
                >
                  {isSel && (
                    <span
                      className="absolute"
                      style={{ top: 10, right: 10, width: 20, height: 20, borderRadius: 999, background: "#7dedb8", display: "grid", placeItems: "center" }}
                    >
                      <Check size={12} color="#060f18" strokeWidth={3} />
                    </span>
                  )}
                  <Icon size={24} strokeWidth={1.75} color={d.iconColor} />
                  <div className="font-display font-bold mt-2" style={{ color: "#fff", fontSize: 14, fontFamily: "Syne, sans-serif" }}>
                    {d.name}
                  </div>
                  <div style={{ color: "#8ec8e0", fontSize: 11, marginTop: 2 }}>{d.sub}</div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={confirm}
            disabled={!selected}
            className="font-display font-bold w-full mt-6"
            style={{
              background: "#7dedb8",
              color: "#060f18",
              padding: 14,
              borderRadius: 10,
              border: "none",
              fontSize: 14,
              fontFamily: "Syne, sans-serif",
              cursor: selected ? "pointer" : "not-allowed",
              opacity: selected ? 1 : 0.5,
            }}
          >
            Bekräfta avdelning →
          </button>
        </div>
      </div>
    </div>
  );
}
