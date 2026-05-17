import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { AppModal, Field, TextInput, TextArea, GhostBtn, MintBtn } from "@/components/AppModal";
import { toast } from "sonner";
import { AlertTriangle, Mail, AlertOctagon, AlertCircle, CheckCircle2, Bot } from "lucide-react";

export const Route = createFileRoute("/utgaende-certifikat")({
  component: UtgaendePage,
});

const stats = [
  { label: "UTGÅR INOM 14 DAGAR", value: "2", color: "#ff4d6a" },
  { label: "UTGÅR INOM 30 DAGAR", value: "1", color: "#ffd166" },
  { label: "UTGÅR INOM 90 DAGAR", value: "3", color: "#7dedb8" },
];

type Row = {
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  role: string;
  company: string;
  icon: string;
  cert: string;
  certDate: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  action: string;
};

const section14: Row[] = [
  {
    initials: "EH", avatarBg: "rgba(255,209,102,0.12)", avatarColor: "#ffd166",
    name: "Erik Holm", role: "Armerare · Dag", company: "Byggelement AB",
    icon: "🪪", cert: "Traverskort", certDate: "Utfärdat: 2024-05-30",
    badge: "14 dagar kvar", badgeBg: "rgba(255,77,106,0.15)", badgeColor: "#ff4d6a", badgeBorder: "rgba(255,77,106,0.3)",
    action: "Förnya →",
  },
  {
    initials: "SB", avatarBg: "rgba(255,77,106,0.12)", avatarColor: "#ff4d6a",
    name: "Sara Berg", role: "Betongarbetare · Dag", company: "Partner2Work AB",
    icon: "🪪", cert: "Betongkurs", certDate: "Aldrig genomförd",
    badge: "Saknas", badgeBg: "rgba(255,77,106,0.15)", badgeColor: "#ff4d6a", badgeBorder: "rgba(255,77,106,0.3)",
    action: "Boka kurs →",
  },
];

const section30: Row[] = [
  {
    initials: "PL", avatarBg: "rgba(125,237,184,0.12)", avatarColor: "#7dedb8",
    name: "Petter Lindgren", role: "Truckförare · Kväll", company: "Partner2Work AB",
    icon: "🪪", cert: "Truckkort B", certDate: "Utfärdat: 2024-06-15",
    badge: "30 dagar kvar", badgeBg: "rgba(255,209,102,0.15)", badgeColor: "#ffd166", badgeBorder: "rgba(255,209,102,0.3)",
    action: "Påminn →",
  },
];

const section90: Row[] = [
  {
    initials: "AJ", avatarBg: "rgba(0,224,150,0.12)", avatarColor: "#00e096",
    name: "Anders Johansson", role: "Gjutare · Dag", company: "Byggelement AB",
    icon: "📋", cert: "Betongkurs", certDate: "Utfärdat: 2023-08-01",
    badge: "87 dagar kvar", badgeBg: "rgba(125,237,184,0.15)", badgeColor: "#7dedb8", badgeBorder: "rgba(125,237,184,0.3)",
    action: "Planera →",
  },
];

function RowItem({ r, last, onAction }: { r: Row; last?: boolean; onAction: (r: Row) => void }) {
  return (
    <div className="flex items-center gap-[14px]" style={{ padding: "16px 20px", borderBottom: last ? "none" : "1px solid #1a3d58" }}>
      <div className="flex items-center justify-center font-bold text-[12px] shrink-0" style={{ width: 34, height: 34, borderRadius: 999, background: r.avatarBg, color: r.avatarColor }}>{r.initials}</div>
      <div className="min-w-0" style={{ width: 220 }}>
        <div className="font-bold text-[13px] text-white truncate">{r.name}</div>
        <div className="text-[11px] text-muted-foreground truncate">{r.role}</div>
        <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(125,237,184,0.1)", color: "#7dedb8" }}>{r.company}</span>
      </div>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center justify-center text-lg shrink-0" style={{ width: 36, height: 36, borderRadius: 999, background: "rgba(125,237,184,0.1)" }}>{r.icon}</div>
        <div className="min-w-0">
          <div className="font-bold text-[13px] text-white truncate">{r.cert}</div>
          <div className="text-[11px] text-muted-foreground truncate">{r.certDate}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="mono font-bold" style={{ background: r.badgeBg, color: r.badgeColor, border: `1px solid ${r.badgeBorder}`, borderRadius: 4, padding: "3px 9px", fontSize: 10 }}>{r.badge}</span>
        <button onClick={() => onAction(r)} className="text-xs font-semibold px-3 py-1.5 rounded-md" style={{ background: "transparent", border: "1px solid #1a3d58", color: "#edfaf4" }}>{r.action}</button>
      </div>
    </div>
  );
}

type ModalKind = null | "fornya" | "bokaKurs" | "planera";

function UtgaendePage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [activeRow, setActiveRow] = useState<Row | null>(null);
  const [datum, setDatum] = useState("");
  const [anteckning, setAnteckning] = useState("");
  const [kurstyp, setKurstyp] = useState("");
  const [plats, setPlats] = useState("");

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

  const handleAction = (r: Row) => {
    setActiveRow(r);
    setDatum(""); setAnteckning(""); setKurstyp(""); setPlats("");
    if (r.action.startsWith("Förnya")) setModal("fornya");
    else if (r.action.startsWith("Boka kurs")) setModal("bokaKurs");
    else if (r.action.startsWith("Påminn")) { toast.success(`SMS-påminnelse skickad till ${r.name}!`); }
    else if (r.action.startsWith("Planera")) setModal("planera");
  };

  const closeModal = () => { setModal(null); setActiveRow(null); };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <main className="px-8 py-7 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-[24px] text-white flex items-center gap-2"><AlertTriangle size={22} strokeWidth={1.75} color="#7dedb8" /> Utgående certifikat</h1>
              <p className="text-sm text-muted-foreground mt-1">Certifikat som kräver förnyelse inom 90 dagar</p>
            </div>
            <button className="text-xs font-bold px-3 py-2 rounded-md inline-flex items-center gap-1.5" style={{ background: "#7dedb8", color: "#060f18" }}><Mail size={14} strokeWidth={1.75} /> Skicka påminnelser</button>
          </div>

          {/* Alert banner */}
          <div className="flex items-center gap-[10px] flex-wrap" style={{ background: "rgba(255,77,106,0.06)", border: "1px solid rgba(255,77,106,0.2)", borderRadius: 8, padding: "12px 18px" }}>
            <span className="red-dot" style={{ width: 7, height: 7 }} />
            <span className="text-[13px] text-foreground/90"><strong>2 certifikat</strong> utgår inom 14 dagar — personal kan inte jobba utan giltiga certifikat.</span>
            <button className="ml-auto text-xs font-bold" style={{ color: "#7dedb8" }}>Åtgärda direkt →</button>
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

          {/* Timeline */}
          <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 10, overflow: "hidden", marginTop: 4 }}>
            <div style={{ background: "rgba(255,77,106,0.06)", borderBottom: "1px solid rgba(255,77,106,0.2)", padding: "10px 20px" }}>
              <div className="mono uppercase font-bold inline-flex items-center gap-1.5" style={{ fontSize: 9, color: "#ff4d6a" }}><AlertOctagon size={12} strokeWidth={1.75} /> KRITISKT — UTGÅR INOM 14 DAGAR</div>
            </div>
            {section14.map((r) => <RowItem key={r.name} r={r} onAction={handleAction} />)}

            <div style={{ background: "rgba(255,209,102,0.06)", borderBottom: "1px solid rgba(255,209,102,0.2)", padding: "10px 20px" }}>
              <div className="mono uppercase font-bold inline-flex items-center gap-1.5" style={{ fontSize: 9, color: "#ffd166" }}><AlertTriangle size={12} strokeWidth={1.75} /> VARNING — UTGÅR INOM 30 DAGAR</div>
            </div>
            {section30.map((r) => <RowItem key={r.name} r={r} onAction={handleAction} />)}

            <div style={{ background: "rgba(125,237,184,0.04)", borderBottom: "1px solid rgba(125,237,184,0.15)", padding: "10px 20px" }}>
              <div className="mono uppercase font-bold inline-flex items-center gap-1.5" style={{ fontSize: 9, color: "#7dedb8" }}><CheckCircle2 size={12} strokeWidth={1.75} /> PLANERA — UTGÅR INOM 90 DAGAR</div>
            </div>
            {section90.map((r, i) => <RowItem key={r.name} r={r} last={i === section90.length - 1} onAction={handleAction} />)}
          </div>

          {/* Bottom card */}
          <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 10, padding: 24, marginTop: 4 }}>
            <div className="font-display font-bold text-white text-[16px] mb-2 flex items-center gap-2"><Bot size={18} strokeWidth={1.75} color="#7dedb8" /> Automatiska påminnelser</div>
            <div className="text-[13px] text-muted-foreground mb-4">WorkReady skickar automatiska SMS-påminnelser till personal och chef när certifikat närmar sig utgångsdatum.</div>
            {[
              "90 dagar innan — Informationsmeddelande till personal",
              "30 dagar innan — Påminnelse med förnyelseinstruktioner",
              "7 dagar innan — Akut varning till chef och personal",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3" style={{ padding: "10px 0", borderBottom: "1px solid #1a3d58" }}>
                <div className="flex items-center justify-center font-bold text-[12px] shrink-0" style={{ width: 24, height: 24, borderRadius: 999, background: "rgba(0,224,150,0.1)", color: "#00e096" }}>✓</div>
                <div className="text-[13px] text-foreground/90">{t}</div>
              </div>
            ))}
            <div className="flex items-center justify-between mt-4">
              <div className="font-bold text-[14px] text-white">Aktivera automatiska påminnelser</div>
              <div className="relative cursor-pointer" style={{ width: 44, height: 24, background: "#7dedb8", borderRadius: 12 }}>
                <div className="absolute" style={{ top: 2, left: 22, width: 20, height: 20, borderRadius: 999, background: "#060f18" }} />
              </div>
            </div>
          </div>
        </main>
      </div>
      <style>{sidebarKeyframes}</style>
    </div>
  );
}
