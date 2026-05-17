import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { AddCompanyModal } from "@/components/AddCompanyModal";
import { PersonDetailModal, type PersonDetail } from "@/components/PersonDetailModal";
import { RefreshCw, Building2 } from "lucide-react";

export const Route = createFileRoute("/inhyrd-personal")({
  component: InhyrdPage,
});

const stats = [
  { label: "TOTALT INHYRD", value: "8", color: "#60b0f4" },
  { label: "GODKÄNDA", value: "6", color: "#7dedb8" },
  { label: "UNDER UPPLÄRNING", value: "2", color: "#ffd166" },
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
  certs: string;
  certColor: string;
};

const rows: Row[] = [
  { initials: "PL", avatarBg: "rgba(125,237,184,0.12)", avatarColor: "#7dedb8", name: "Petter Lindgren", role: "Truckförare · Kväll", dept: "Lager & Utskeppning", start: "2024-11-01", percent: 65, barColor: "#7dedb8", status: "Pågår", certs: "✓ Truckkort B", certColor: "#00e096" },
  { initials: "SB", avatarBg: "rgba(255,77,106,0.12)", avatarColor: "#ff4d6a", name: "Sara Berg", role: "Betongarbetare · Dag", dept: "Gjutavdelningen", start: "2024-11-12", percent: 0, barColor: "#ff4d6a", status: "Ej start", certs: "✗ Betongkurs saknas", certColor: "#ff4d6a" },
  { initials: "LN", avatarBg: "rgba(0,224,150,0.12)", avatarColor: "#00e096", name: "Lisa Nordin", role: "Armerare · Dag", dept: "Armeringsavdelningen", start: "2024-10-15", percent: 100, barColor: "#00e096", status: "Godkänd", certs: "✓ Betongkurs", certColor: "#00e096" },
  { initials: "TK", avatarBg: "rgba(0,224,150,0.12)", avatarColor: "#00e096", name: "Tommy Karlsson", role: "Truckförare · Dag", dept: "Lager & Utskeppning", start: "2024-09-01", percent: 100, barColor: "#00e096", status: "Godkänd", certs: "✓ Truckkort B · ✓ Traverskort", certColor: "#00e096" },
  { initials: "BM", avatarBg: "rgba(255,209,102,0.12)", avatarColor: "#ffd166", name: "Bo Magnusson", role: "Lagermedarbetare · Dag", dept: "Lager & Utskeppning", start: "2024-11-10", percent: 25, barColor: "#ffd166", status: "Pågår", certs: "✗ Truckkort saknas", certColor: "#ff4d6a" },
];

function statusStyle(s: Status): React.CSSProperties {
  if (s === "Godkänd") return { background: "rgba(0,224,150,0.1)", color: "#00e096", border: "1px solid rgba(0,224,150,0.2)" };
  if (s === "Pågår") return { background: "rgba(255,209,102,0.1)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.2)" };
  return { background: "rgba(255,77,106,0.1)", color: "#ff4d6a", border: "1px solid rgba(255,77,106,0.2)" };
}

function InhyrdPage() {
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
              <h1 className="font-display font-bold text-[24px] text-white flex items-center gap-2"><RefreshCw size={22} strokeWidth={1.75} color="#7dedb8" /> Inhyrd personal</h1>
              <p className="text-sm text-muted-foreground mt-1">Översikt över inhyrd personal från era bemanningsbolag</p>
            </div>
            <button className="text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>+ Lägg till bemanningsbolag</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="relative overflow-hidden" style={{ background: "#0e2538", border: "1px solid #1a3d58", borderTop: `2px solid ${s.color}`, borderRadius: 10, padding: 20 }}>
                <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 120, height: 120, background: `radial-gradient(circle at top right, ${s.color}22, transparent 70%)` }} />
                <div className="mono text-[9px] font-bold uppercase" style={{ color: "#3d6a7a" }}>{s.label}</div>
                <div className="font-display font-bold mt-2" style={{ fontSize: 46, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Partner2Work section header */}
          <div className="flex items-center gap-3 flex-wrap" style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: "10px 10px 0 0", padding: "16px 20px", marginBottom: 0 }}>
            <div className="flex items-center justify-center font-display font-bold text-[14px] shrink-0" style={{ width: 40, height: 40, borderRadius: 8, background: "#7dedb8", color: "#060f18" }}>P2</div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold text-white text-[16px]">Partner2Work AB</div>
              <div className="text-[11px] text-muted-foreground">Vänersborg · Bemanning & Rekrytering</div>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="px-2 py-1 rounded" style={{ background: "rgba(125,237,184,0.1)", color: "#7dedb8" }}>8 uthyrda</span>
              <span className="px-2 py-1 rounded" style={{ background: "rgba(0,224,150,0.1)", color: "#00e096" }}>6 godkända</span>
              <span className="px-2 py-1 rounded" style={{ background: "rgba(255,209,102,0.1)", color: "#ffd166" }}>2 pågår</span>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "#0b1e2d", border: "1px solid #1a3d58", borderTop: "none", borderRadius: "0 0 10px 10px", marginTop: -20 }}>
            <div className="grid mono uppercase font-bold" style={{ gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 100px 110px 1.7fr", background: "rgba(0,0,0,0.2)", color: "#3d6a7a", fontSize: 9, padding: "10px 16px", gap: 12 }}>
              <div>Person</div><div>Roll</div><div>Avdelning</div><div>Startdatum</div><div>Framsteg</div><div>Status</div><div>Certifikat</div>
            </div>
            {rows.map((r, i) => (
              <div key={r.name} className="inhyrd-row grid items-center" style={{ gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 100px 110px 1.7fr", padding: "14px 16px", borderBottom: i === rows.length - 1 ? "none" : "1px solid rgba(26,61,88,0.4)", gap: 12, fontSize: 12 }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center font-bold text-[11px] shrink-0" style={{ width: 32, height: 32, borderRadius: 999, background: r.avatarBg, color: r.avatarColor }}>{r.initials}</div>
                  <div className="font-bold text-[13px] text-white truncate">{r.name}</div>
                </div>
                <div className="text-foreground/90 truncate">{r.role}</div>
                <div className="text-foreground/90 truncate">{r.dept}</div>
                <div className="mono text-[11px]" style={{ color: "#3d6a7a" }}>{r.start}</div>
                <div>
                  <div style={{ width: 80, height: 3, background: "#1a3d58", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${r.percent}%`, height: "100%", background: r.barColor }} />
                  </div>
                  <div className="mono text-[10px] mt-1" style={{ color: r.barColor }}>{r.percent}%</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={statusStyle(r.status)}>{r.status}</span>
                </div>
                <div className="text-[11px] truncate" style={{ color: r.certColor }}>{r.certs}</div>
              </div>
            ))}
          </div>

          {/* Add company card */}
          <button className="add-company flex flex-col items-center gap-3" style={{ background: "transparent", border: "1px dashed #1a3d58", borderRadius: 10, padding: 32, marginTop: 4, cursor: "pointer", transition: "all .2s" }}>
            <Building2 size={32} strokeWidth={1.75} color="#7dedb8" />
            <div className="font-display font-bold text-white text-[16px]">Lägg till bemanningsbolag</div>
            <div className="text-[13px] text-muted-foreground text-center">Klicka för att lägga till ett nytt bemanningsbolag och deras personal</div>
            <span className="font-bold" style={{ background: "#7dedb8", color: "#060f18", padding: "10px 24px", borderRadius: 6, fontSize: 13 }}>+ Lägg till</span>
          </button>
        </main>
      </div>
      <style>{sidebarKeyframes}</style>
      <style>{`
        .inhyrd-row:hover { background: rgba(125,237,184,0.03); }
        .add-company:hover { border-color: #7dedb8 !important; background: rgba(125,237,184,0.03) !important; }
      `}</style>
    </div>
  );
}
