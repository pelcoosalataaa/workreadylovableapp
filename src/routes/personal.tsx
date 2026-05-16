import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";

export const Route = createFileRoute("/personal")({
  component: PersonalPage,
});

type Status = "Godkänd" | "Pågår" | "Ej start";
type Company = "Byggelement AB" | "Partner2Work AB" | "Ikett Personalpartner";

type Person = {
  initials: string;
  name: string;
  role: string;
  dept: string;
  company: Company;
  percent: number;
  barColor: string;
  avatarBg: string;
  avatarColor: string;
  status: Status;
  certs: string;
};

const people: Person[] = [
  { initials: "AJ", name: "Anders Johansson", role: "Gjutare · Dag", dept: "Gjutavdelningen", company: "Byggelement AB", percent: 100, barColor: "#00e096", avatarBg: "rgba(0,224,150,0.12)", avatarColor: "#00e096", status: "Godkänd", certs: "✓ Betongkurs  ✓ Traverskort" },
  { initials: "MK", name: "Maria Karlsson", role: "CNC-operatör · Dag", dept: "CNC-produktion", company: "Byggelement AB", percent: 100, barColor: "#00e096", avatarBg: "rgba(0,224,150,0.12)", avatarColor: "#00e096", status: "Godkänd", certs: "✓ CNC-utbildning" },
  { initials: "PL", name: "Petter Lindgren", role: "Truckförare · Kväll", dept: "Lager & Utskeppning", company: "Partner2Work AB", percent: 65, barColor: "#7dedb8", avatarBg: "rgba(125,237,184,0.12)", avatarColor: "#7dedb8", status: "Pågår", certs: "✓ Truckkort B" },
  { initials: "SB", name: "Sara Berg", role: "Betongarbetare · Dag", dept: "Gjutavdelningen", company: "Partner2Work AB", percent: 0, barColor: "#ff4d6a", avatarBg: "rgba(255,77,106,0.12)", avatarColor: "#ff4d6a", status: "Ej start", certs: "✗ Betongkurs saknas" },
  { initials: "JN", name: "Johan Nilsson", role: "Montör · Dag", dept: "Montering", company: "Ikett Personalpartner", percent: 40, barColor: "#38b6ff", avatarBg: "rgba(56,182,255,0.12)", avatarColor: "#38b6ff", status: "Pågår", certs: "✗ Heta arbeten saknas" },
  { initials: "EH", name: "Erik Holm", role: "Armerare · Dag", dept: "Armeringsavdelningen", company: "Byggelement AB", percent: 100, barColor: "#00e096", avatarBg: "rgba(255,209,102,0.12)", avatarColor: "#ffd166", status: "Godkänd", certs: "⚠ Traverskort 14 dagar" },
];

const filters = ["Alla", "Egen personal", "Partner2Work", "Ikett", "Godkända", "Ej påbörjat"] as const;
type Filter = typeof filters[number];

function matchesFilter(p: Person, f: Filter): boolean {
  switch (f) {
    case "Alla": return true;
    case "Egen personal": return p.company === "Byggelement AB";
    case "Partner2Work": return p.company === "Partner2Work AB";
    case "Ikett": return p.company === "Ikett Personalpartner";
    case "Godkända": return p.status === "Godkänd";
    case "Ej påbörjat": return p.status === "Ej start";
  }
}

function badgeStyle(status: Status): React.CSSProperties {
  if (status === "Godkänd") return { background: "rgba(0,224,150,0.1)", color: "#00e096", border: "1px solid rgba(0,224,150,0.2)" };
  if (status === "Pågår") return { background: "rgba(255,209,102,0.1)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.2)" };
  return { background: "rgba(255,77,106,0.1)", color: "#ff4d6a", border: "1px solid rgba(255,77,106,0.2)" };
}

function PersonalPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("Alla");
  const [query, setQuery] = useState("");

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

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((p) => matchesFilter(p, filter) && (!q || p.name.toLowerCase().includes(q)));
  }, [filter, query]);

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <main className="px-8 py-7 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-[24px] text-white">👷 Personal</h1>
              <p className="text-sm text-muted-foreground mt-1">Byggelement Ucklum · 27 aktiva medarbetare</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="🔍 Sök person..."
                className="text-xs px-3 py-2 rounded-md border border-border bg-card text-foreground outline-none focus:border-primary w-56"
              />
              <button className="text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>+ Lägg till personal</button>
            </div>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2" style={{ marginBottom: 20 }}>
            {filters.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: active ? "#7dedb8" : "transparent",
                    color: active ? "#060f18" : "#3d6a7a",
                    border: "1px solid #1a3d58",
                    borderRadius: 6,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-hidden" style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 10 }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                  {["Person", "Roll", "Avdelning", "Bemanningsbolag", "Framsteg", "Status", "Certifikat"].map((h) => (
                    <th key={h} className="mono text-left font-bold uppercase" style={{ color: "#3d6a7a", fontSize: 9, padding: "10px 16px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.initials} className="transition-colors hover:bg-[rgba(125,237,184,0.03)]" style={{ borderBottom: "1px solid rgba(26,61,88,0.4)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex items-center gap-3">
                        <div className="rounded-full flex items-center justify-center font-bold text-[11px] shrink-0" style={{ width: 34, height: 34, background: p.avatarBg, color: p.avatarColor }}>{p.initials}</div>
                        <div className="text-[13px] font-bold">{p.name}</div>
                      </div>
                    </td>
                    <td className="text-[11px] text-muted-foreground" style={{ padding: "12px 16px" }}>{p.role}</td>
                    <td className="text-xs" style={{ padding: "12px 16px" }}>{p.dept}</td>
                    <td className="text-xs" style={{ padding: "12px 16px" }}>{p.company}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="rounded-full overflow-hidden" style={{ width: 80, height: 3, background: "#1a3d58" }}>
                        <div className="h-full rounded-full" style={{ width: `${p.percent}%`, background: p.barColor }} />
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={badgeStyle(p.status)}>{p.status}</span>
                    </td>
                    <td className="text-[11px]" style={{ padding: "12px 16px", color: "#edfaf4" }}>{p.certs}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-xs text-muted-foreground" style={{ padding: 24 }}>Inga personer matchar filtret.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <style>{sidebarKeyframes}</style>
    </div>
  );
}
