import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { Building2, X } from "lucide-react";

export const Route = createFileRoute("/bemanningsbolag")({
  component: BemanningsbolagPage,
});

const stats = [
  { label: "AKTIVA BOLAG", value: "1", color: "#60b0f4" },
  { label: "TOTALT UTHYRD", value: "8", color: "#7dedb8" },
  { label: "GODKÄNDA", value: "6", color: "#00e096" },
];

type Status = "Godkänd" | "Pågår" | "Ej start";

type Row = {
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  role: string;
  dept: string;
  start: string;
  percent: number;
  barColor: string;
  status: Status;
};

const rows: Row[] = [
  { initials: "PL", avatarBg: "rgba(125,237,184,0.12)", avatarColor: "#7dedb8", name: "Petter Lindgren", role: "Truckförare · Kväll", dept: "Lager & Utskeppning", start: "2024-11-01", percent: 65, barColor: "#7dedb8", status: "Pågår" },
  { initials: "SB", avatarBg: "rgba(255,77,106,0.12)", avatarColor: "#ff4d6a", name: "Sara Berg", role: "Betongarbetare · Dag", dept: "Gjutavdelningen", start: "2024-11-12", percent: 0, barColor: "#ff4d6a", status: "Ej start" },
  { initials: "LN", avatarBg: "rgba(0,224,150,0.12)", avatarColor: "#00e096", name: "Lisa Nordin", role: "Armerare · Dag", dept: "Armeringsavdelningen", start: "2024-10-15", percent: 100, barColor: "#00e096", status: "Godkänd" },
  { initials: "TK", avatarBg: "rgba(0,224,150,0.12)", avatarColor: "#00e096", name: "Tommy Karlsson", role: "Truckförare · Dag", dept: "Lager & Utskeppning", start: "2024-09-01", percent: 100, barColor: "#00e096", status: "Godkänd" },
  { initials: "BM", avatarBg: "rgba(255,209,102,0.12)", avatarColor: "#ffd166", name: "Bo Magnusson", role: "Lagermedarbetare · Dag", dept: "Lager & Utskeppning", start: "2024-11-10", percent: 25, barColor: "#ffd166", status: "Pågår" },
];

function statusStyle(s: Status): React.CSSProperties {
  if (s === "Godkänd") return { background: "rgba(0,224,150,0.1)", color: "#00e096", border: "1px solid rgba(0,224,150,0.2)" };
  if (s === "Pågår") return { background: "rgba(255,209,102,0.1)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.2)" };
  return { background: "rgba(255,77,106,0.1)", color: "#ff4d6a", border: "1px solid rgba(255,77,106,0.2)" };
}

function BemanningsbolagPage() {
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

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <main className="px-8 py-7 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-[24px] text-white flex items-center gap-2">
                <Building2 size={22} strokeWidth={1.75} color="#7dedb8" /> Bemanningsbolag
              </h1>
              <p className="text-sm mt-1" style={{ color: "#6a9ab0" }}>Hantera era bemanningspartners och deras personal</p>
            </div>
            <button className="text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>+ Lägg till bolag</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="relative overflow-hidden" style={{ background: "#0e2538", border: "1px solid #1a3d58", borderTop: `2px solid ${s.color}`, borderRadius: 10, padding: 20 }}>
                <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 120, height: 120, background: `radial-gradient(circle at top right, ${s.color}22, transparent 70%)` }} />
                <div className="mono text-[9px] font-bold uppercase" style={{ color: "#6a9ab0" }}>{s.label}</div>
                <div className="font-display font-bold mt-2" style={{ fontSize: 46, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Partner2Work company card */}
          <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
            {/* Card header */}
            <div className="flex items-center gap-4 flex-wrap" style={{ padding: "20px 24px", borderBottom: "1px solid #1a3d58" }}>
              <div className="flex items-center justify-center font-display font-bold text-[18px] shrink-0" style={{ width: 48, height: 48, borderRadius: 10, background: "#7dedb8", color: "#060f18" }}>P2</div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-white text-[18px]">Partner2Work AB</div>
                <div className="text-[12px]" style={{ color: "#6a9ab0" }}>Vänersborg · Bemanning & Rekrytering</div>
                <div className="mono text-[11px] mt-0.5" style={{ color: "#6a9ab0" }}>info@partner2work.se · 010-889 98 30</div>
              </div>
              <div className="flex items-center" style={{ gap: 24 }}>
                <div className="text-center">
                  <div className="font-display font-bold" style={{ fontSize: 28, color: "#60b0f4", lineHeight: 1 }}>8</div>
                  <div className="text-[10px] mt-1" style={{ color: "#6a9ab0" }}>Uthyrda</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold" style={{ fontSize: 28, color: "#00e096", lineHeight: 1 }}>6</div>
                  <div className="text-[10px] mt-1" style={{ color: "#6a9ab0" }}>Godkända</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold" style={{ fontSize: 28, color: "#ffd166", lineHeight: 1 }}>2</div>
                  <div className="text-[10px] mt-1" style={{ color: "#6a9ab0" }}>Pågår</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[11px] font-semibold px-3 py-1.5 rounded-md border" style={{ borderColor: "#1a3d58", color: "#edfaf4", background: "transparent" }}>Kontakta</button>
                <button className="text-[11px] font-bold px-3 py-1.5 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>Hantera</button>
              </div>
            </div>

            {/* Table */}
            <div>
              <div className="grid mono uppercase font-bold" style={{ gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 110px 110px", background: "rgba(0,0,0,0.2)", color: "#6a9ab0", fontSize: 9, padding: "10px 20px", gap: 12 }}>
                <div>Person</div><div>Roll</div><div>Avdelning</div><div>Startdatum</div><div>Framsteg</div><div>Status</div>
              </div>
              {rows.map((r, i) => (
                <div key={r.name} className="bb-row grid items-center" style={{ gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 110px 110px", padding: "12px 20px", borderBottom: i === rows.length - 1 ? "none" : "1px solid rgba(26,61,88,0.4)", gap: 12, fontSize: 12 }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center font-bold text-[11px] shrink-0" style={{ width: 32, height: 32, borderRadius: 999, background: r.avatarBg, color: r.avatarColor }}>{r.initials}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-[13px] text-white truncate">{r.name}</div>
                      <div className="text-[11px] truncate" style={{ color: "#8ec8e0" }}>{r.role}</div>
                    </div>
                  </div>
                  <div className="text-foreground/90 truncate">{r.role}</div>
                  <div className="text-foreground/90 truncate">{r.dept}</div>
                  <div className="mono text-[11px]" style={{ color: "#6a9ab0" }}>{r.start}</div>
                  <div>
                    <div style={{ width: 80, height: 3, background: "#1a3d58", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${r.percent}%`, height: "100%", background: r.barColor }} />
                    </div>
                    <div className="mono text-[10px] mt-1" style={{ color: "#8ec8e0" }}>{r.percent}%</div>
                  </div>
                  <div>
                    <span className="mono font-bold rounded" style={{ ...statusStyle(r.status), fontSize: 10, padding: "3px 9px" }}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add company card */}
          <button className="add-company flex flex-col items-center text-center" style={{ background: "transparent", border: "1px dashed #1a3d58", borderRadius: 10, padding: 40, marginTop: 8, cursor: "pointer", transition: "all .2s", gap: 12 }}>
            <Building2 size={40} strokeWidth={1.75} color="#1a3d58" />
            <div className="font-display font-bold text-white text-[18px]" style={{ marginTop: 8 }}>Lägg till bemanningsbolag</div>
            <div className="text-[13px]" style={{ color: "#6a9ab0", maxWidth: 400, lineHeight: 1.6 }}>Lägg till ett nytt bemanningsbolag för att hantera deras uthyrda personal i WorkReady</div>
            <span className="font-bold" style={{ background: "#7dedb8", color: "#060f18", padding: "12px 28px", borderRadius: 6, fontSize: 13, marginTop: 8 }}>+ Lägg till bolag</span>
          </button>
        </main>
      </div>
      <style>{sidebarKeyframes}</style>
      <style>{`
        .bb-row:hover { background: rgba(125,237,184,0.03); }
        .add-company:hover { border-color: #7dedb8 !important; background: rgba(125,237,184,0.02) !important; }
      `}</style>
    </div>
  );
}
