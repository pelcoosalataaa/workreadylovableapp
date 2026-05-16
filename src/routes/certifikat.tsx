import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { Award, Plus } from "lucide-react";

export const Route = createFileRoute("/certifikat")({
  component: CertifikatPage,
});

type Status = "valid" | "expiring" | "missing";

type Cert = {
  icon: string;
  iconBg: string;
  name: string;
  person: string;
  date: string;
  status: Status;
  tag: string;
  company: string;
};

const certs: Cert[] = [
  { icon: "🏗", iconBg: "rgba(0,224,150,0.1)", name: "Betongkurs", person: "Anders Johansson", date: "Godkänd: 2024-11-05", status: "valid", tag: "✓ Giltigt", company: "Byggelement AB" },
  { icon: "⚠️", iconBg: "rgba(0,224,150,0.1)", name: "Säkerhet & Skydd", person: "Anders Johansson", date: "Godkänd: 2024-11-05", status: "valid", tag: "✓ Giltigt", company: "Byggelement AB" },
  { icon: "🚜", iconBg: "rgba(255,209,102,0.1)", name: "Traverskort", person: "Erik Holm", date: "Utgår: 2026-05-30", status: "expiring", tag: "⚠ Utgår om 14 dagar", company: "Byggelement AB" },
  { icon: "🚜", iconBg: "rgba(255,209,102,0.1)", name: "Truckkort B", person: "Petter Lindgren", date: "Utgår: 2026-06-15", status: "expiring", tag: "⚠ Utgår om 30 dagar", company: "Partner2Work AB" },
  { icon: "🏗", iconBg: "rgba(255,77,106,0.1)", name: "Betongkurs", person: "Sara Berg", date: "Ej genomförd", status: "missing", tag: "✗ Saknas", company: "Partner2Work AB" },
  { icon: "🔥", iconBg: "rgba(255,77,106,0.1)", name: "Heta arbeten", person: "Johan Nilsson", date: "Ej genomförd", status: "missing", tag: "✗ Saknas", company: "Ikett Personalpartner" },
  { icon: "📐", iconBg: "rgba(0,224,150,0.1)", name: "Ritningsläsning", person: "Maria Karlsson", date: "Godkänd: 2024-11-07", status: "valid", tag: "✓ Giltigt", company: "Byggelement AB" },
  { icon: "⚙️", iconBg: "rgba(0,224,150,0.1)", name: "CNC-utbildning", person: "Maria Karlsson", date: "Godkänd: 2024-11-07", status: "valid", tag: "✓ Giltigt", company: "Byggelement AB" },
];

const filters = ["Alla", "Giltiga", "Utgår snart", "Saknas", "Truckkort", "Traverskort", "Betongkurs"] as const;
type Filter = typeof filters[number];

function matches(c: Cert, f: Filter): boolean {
  switch (f) {
    case "Alla": return true;
    case "Giltiga": return c.status === "valid";
    case "Utgår snart": return c.status === "expiring";
    case "Saknas": return c.status === "missing";
    case "Truckkort": return c.name.toLowerCase().includes("truck");
    case "Traverskort": return c.name.toLowerCase().includes("travers");
    case "Betongkurs": return c.name.toLowerCase().includes("betong");
  }
}

function cardBorder(s: Status) {
  if (s === "expiring") return "1px solid rgba(255,209,102,0.4)";
  if (s === "missing") return "1px solid rgba(255,77,106,0.3)";
  return "1px solid #1a3d58";
}

function cardShadow(s: Status) {
  if (s === "valid") return "0 0 0 1px rgba(0,224,150,0.1)";
  if (s === "expiring") return "0 0 0 1px rgba(255,209,102,0.2)";
  return "0 0 0 1px rgba(255,77,106,0.15)";
}

function tagStyle(s: Status): React.CSSProperties {
  if (s === "valid") return { background: "rgba(0,224,150,0.12)", color: "#00e096", border: "1px solid rgba(0,224,150,0.25)" };
  if (s === "expiring") return { background: "rgba(255,209,102,0.12)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.25)" };
  return { background: "rgba(255,77,106,0.12)", color: "#ff4d6a", border: "1px solid rgba(255,77,106,0.25)" };
}

const statCards = [
  { label: "TOTALT CERTIFIKAT", value: "24", color: "#7dedb8" },
  { label: "GILTIGA", value: "21", color: "#00e096" },
  { label: "UTGÅR SNART", value: "2", color: "#ffd166" },
  { label: "SAKNAS", value: "3", color: "#ff4d6a" },
];

function CertifikatPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("Alla");

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

  const visible = useMemo(() => certs.filter((c) => matches(c, filter)), [filter]);

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <main className="px-8 py-7 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-[24px] text-white flex items-center gap-2"><Award size={22} strokeWidth={1.75} color="#7dedb8" /> Certifikat & Godkännanden</h1>
              <p className="text-sm text-muted-foreground mt-1">Alla certifikat sparas automatiskt och visas vid tillsyn</p>
            </div>
            <button className="text-xs font-semibold px-3 py-2 rounded-md" style={{ background: "transparent", border: "1px solid #1a3d58", color: "#edfaf4" }}>⬇ Exportera alla</button>
          </div>

          {/* Alert banner */}
          <div className="flex items-center gap-3 flex-wrap" style={{ background: "rgba(255,209,102,0.08)", border: "1px solid rgba(255,209,102,0.3)", borderRadius: 10, padding: "12px 16px" }}>
            <span className="cert-pulse-dot" />
            <span className="text-[13px]" style={{ color: "#ffd166" }}>
              <strong>2 certifikat</strong> utgår inom 30 dagar — åtgärda innan det är för sent.
            </span>
            <button onClick={() => setFilter("Utgår snart")} className="ml-auto text-xs font-bold" style={{ color: "#7dedb8" }}>Se alla →</button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="relative overflow-hidden" style={{ background: "#0e2538", border: "1px solid #1a3d58", borderTop: `2px solid ${s.color}`, borderRadius: 10, padding: 20 }}>
                <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 120, height: 120, background: `radial-gradient(circle at top right, ${s.color}22, transparent 70%)` }} />
                <div className="mono text-[9px] font-bold uppercase" style={{ color: "#3d6a7a" }}>{s.label}</div>
                <div className="font-display font-bold mt-2" style={{ fontSize: 46, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2">
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
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-3 gap-4">
            {visible.map((c, i) => (
              <div
                key={i}
                className={`cert-card transition-all ${c.status === "expiring" ? "cert-expiring" : ""}`}
                style={{
                  background: "#0e2538",
                  border: cardBorder(c.status),
                  borderRadius: 10,
                  padding: 20,
                  boxShadow: cardShadow(c.status),
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center justify-center text-xl shrink-0" style={{ width: 40, height: 40, background: c.iconBg, borderRadius: 8 }}>{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-white text-[16px] truncate">{c.name}</div>
                    <div className="text-[13px] text-foreground/90 truncate">{c.person}</div>
                  </div>
                </div>
                <div className="mono text-[11px] mb-3" style={{ color: "#3d6a7a" }}>{c.date}</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={tagStyle(c.status)}>{c.tag}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(125,237,184,0.1)", color: "#7dedb8" }}>{c.company}</span>
                </div>
              </div>
            ))}

            {/* Add card */}
            <div
              className="flex flex-col items-center justify-center text-center gap-2"
              style={{ background: "transparent", border: "1px dashed #1a3d58", borderRadius: 10, padding: 20, minHeight: 180 }}
            >
              <Plus size={28} strokeWidth={1.75} color="#7dedb8" />
              <div className="font-display font-bold text-white text-[14px]">Lägg till certifikat</div>
              <div className="text-[11px] text-muted-foreground">Manuellt eller via utbildning</div>
              <button className="mt-1 text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>+ Nytt certifikat</button>
            </div>
          </div>
        </main>
      </div>
      <style>{sidebarKeyframes}</style>
      <style>{`
        .cert-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
        .cert-pulse-dot { width:10px; height:10px; border-radius:999px; background:#ffd166; box-shadow:0 0 0 0 rgba(255,209,102,0.6); animation: certPulse 1.8s infinite; }
        @keyframes certPulse { 0%,100%{opacity:1; box-shadow:0 0 0 0 rgba(255,209,102,0.5)} 50%{opacity:.55; box-shadow:0 0 0 8px rgba(255,209,102,0)} }
        @keyframes expiringGlow { 0%,100%{box-shadow:0 0 0 1px rgba(255,209,102,0.2)} 50%{box-shadow:0 0 0 1px rgba(255,209,102,0.55), 0 0 16px rgba(255,209,102,0.2)} }
        .cert-expiring { animation: expiringGlow 2.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
