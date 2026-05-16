import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { Users, Building2, RefreshCw, Bot, CircleDot } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
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
        <TopBar />
        <main className="px-8 py-7 flex flex-col gap-6">
          <WelcomeRow />
          <AlertBanner />
          <StatsRow />
          <div className="grid grid-cols-[3fr_2fr] gap-4">
            <PersonalCard />
            <AiActivityCard />
          </div>
          <ModulesSection />
        </main>
      </div>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,224,150,0.6)} 50%{opacity:.6;box-shadow:0 0 0 6px rgba(0,224,150,0)} }
        @keyframes redPulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,77,106,0.5)} 50%{opacity:.5;box-shadow:0 0 0 6px rgba(255,77,106,0)} }
        @keyframes mintPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .live-dot{width:8px;height:8px;border-radius:999px;background:#00e096;animation:livePulse 2s infinite}
        .red-dot{width:8px;height:8px;border-radius:999px;background:#ff4d6a;animation:redPulse 1.6s infinite}
        .mint-pulse{animation:mintPulse 1.5s infinite}
        .shimmer-bar{background:linear-gradient(90deg,#1a3d58,#7dedb8,#1a3d58);background-size:200% 100%;animation:shimmer 2s linear infinite}
        .mono{font-family:'Space Mono',ui-monospace,monospace;letter-spacing:.08em}
      `}</style>
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b border-border" style={{ background: "#0b1e2d" }}>
      <div className="flex items-center gap-3">
        <h1 className="font-display font-bold text-[18px]">Dashboard</h1>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: "rgba(0,224,150,0.12)", color: "#00e096" }}>
          <span className="live-dot" />Live
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Lördag, 16 maj 2026</span>
        <button className="text-xs px-3 py-2 rounded-md border border-border hover:bg-white/5 transition">+ Bjud in personal</button>
        <button className="text-xs font-bold px-3 py-2 rounded-md inline-flex items-center gap-1.5" style={{ background: "#7dedb8", color: "#060f18" }}><CircleDot size={14} strokeWidth={1.75} /> Ny modul</button>
      </div>
    </header>
  );
}

function WelcomeRow() {
  return (
    <div className="flex items-end justify-between flex-wrap gap-3">
      <div>
        <h2 className="font-display font-bold text-[26px]">Välkommen, <span style={{ color: "#7dedb8" }}>Lars</span> 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">Byggelement Ucklum · 27 aktiva medarbetare</p>
      </div>
      <div className="flex gap-2">
        <span className="text-xs px-3 py-1.5 rounded-full border border-border bg-card">Partner2Work · 8 uthyrda</span>
        <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: "rgba(125,237,184,0.12)", color: "#7dedb8", border: "1px solid rgba(125,237,184,0.3)" }}>AI Aktiv</span>
      </div>
    </div>
  );
}

function AlertBanner() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.3)" }}>
      <span className="red-dot shrink-0" />
      <p className="text-xs flex-1">
        <span style={{ color: "#ff4d6a", fontWeight: 600 }}>Sara Berg</span> har inte påbörjat sin utbildning — börjar måndag. <span className="text-muted-foreground mx-2">|</span> <span style={{ color: "#ff4d6a", fontWeight: 600 }}>Erik Holm</span> — traverskort utgår om 14 dagar.
      </p>
      <a className="text-xs font-semibold whitespace-nowrap hover:underline" style={{ color: "#7dedb8" }} href="#">Åtgärda →</a>
    </div>
  );
}

function StatsRow() {
  const stats = [
    { color: "#60b0f4", label: "PERSONAL TOTALT", value: "27", sub: "↑ 3 nya denna vecka" },
    { color: "#7dedb8", label: "GODKÄNDA & REDO", value: "19", sub: "70% av alla" },
    { color: "#ffd166", label: "UNDER UPPLÄRNING", value: "5", sub: "Pågår just nu" },
    { color: "#ff4d6a", label: "EJ PÅBÖRJAT", value: "3", sub: "⚠ SMS skickat" },
  ];
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="relative overflow-hidden rounded-[10px] border border-border p-5" style={{ background: "#0b1e2d" }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: s.color }} />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${s.color}22, transparent 70%)` }} />
          <div className="mono text-[9px] font-bold text-muted-foreground">{s.label}</div>
          <div className="font-display font-bold text-[46px] leading-none mt-2" style={{ color: s.color }}>{s.value}</div>
          <div className="text-[11px] text-muted-foreground mt-2">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function PersonRow({ initials, name, role, percent, color, status }: { initials: string; name: string; role: string; percent: number; color: string; status: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: `${color}22`, color }}>{initials}</div>
      <div className="min-w-0 w-44">
        <div className="text-sm font-semibold truncate">{name}</div>
        <div className="text-[11px] truncate" style={{ color: "#8ec8e0" }}>{role}</div>
      </div>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1a3d58" }}>
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: color }} />
      </div>
      <div className="text-xs font-semibold w-20 text-right" style={{ color: status.includes("Ej") ? "#ff4d6a" : "#8ec8e0" }}>{status}</div>
    </div>
  );
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono text-[9px] font-bold uppercase px-3 py-1.5 mt-2 rounded" style={{ background: "rgba(125,237,184,0.08)", color: "#7dedb8" }}>{children}</div>
  );
}

function PersonalCard() {
  return (
    <div className="rounded-[10px] border border-border p-5" style={{ background: "#0e2538" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-base flex items-center gap-2"><Users size={18} strokeWidth={1.75} color="#7dedb8" /> Personal — Status idag</h3>
        <div className="flex gap-2">
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(125,237,184,0.12)", color: "#7dedb8" }}>P2W · 8</span>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full border border-border text-muted-foreground">Egen · 19</span>
        </div>
      </div>

      <SectionDivider><span className="inline-flex items-center gap-1.5"><Building2 size={12} strokeWidth={1.75} /> Egen personal — Byggelement AB</span></SectionDivider>
      <PersonRow initials="AJ" name="Anders Johansson" role="Betongarbetare · Dag" percent={100} color="#00e096" status="100% ✓" />
      <PersonRow initials="MK" name="Maria Karlsson" role="CNC-operatör · Dag" percent={100} color="#00e096" status="100% ✓" />

      <SectionDivider><span className="inline-flex items-center gap-1.5"><RefreshCw size={12} strokeWidth={1.75} /> Inhyrd — Partner2Work AB</span></SectionDivider>
      <PersonRow initials="PL" name="Petter Lindgren" role="Truckförare · Kväll" percent={65} color="#7dedb8" status="65%" />
      <PersonRow initials="SB" name="Sara Berg" role="Betongarbetare · Dag" percent={0} color="#ff4d6a" status="Ej start ⚠" />


      <button className="mt-4 w-full text-xs font-semibold py-2.5 rounded-md border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary transition">
        + Lägg till bemanningsbolag
      </button>
    </div>
  );
}

function AiActivityCard() {
  const items = [
    { icon: "✓", color: "#00e096", pulse: false, label: "Anders Johansson godkänd", sub: "Säkerhet vid gjutning · 4/4 rätt", time: "08:14" },
    { icon: "✓", color: "#00e096", pulse: false, label: "SMS skickat — Sara Berg", sub: "Påminnelse · börjar måndag", time: "09:00" },
    { icon: "↻", color: "#7dedb8", pulse: true, label: "Bygger modul — Traverskörning", sub: "Inspelad av Erik Svensson · ~2 min", time: "Nu" },
    { icon: "○", color: "#3d6a7a", pulse: false, label: "Veckorapport — Lars", sub: "Alla avdelningar · fredag", time: "Fre" },
    { icon: "○", color: "#3d6a7a", pulse: false, label: "Certifikatpåminnelse", sub: "Erik Holm · traverskort · 14 dagar", time: "Snart" },
  ];
  return (
    <div className="rounded-[10px] border border-border p-5" style={{ background: "#0e2538" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-base flex items-center gap-2"><Bot size={18} strokeWidth={1.75} color="#7dedb8" /> AI-aktivitet</h3>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5" style={{ background: "rgba(0,224,150,0.12)", color: "#00e096" }}>
          <span className="live-dot" />Aktiv nu
        </span>
      </div>
      <div className="flex flex-col">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${it.pulse ? "mint-pulse" : ""}`} style={{ background: `${it.color}22`, color: it.color }}>{it.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{it.label}</div>
              <div className="text-[11px] text-muted-foreground truncate">{it.sub}</div>
            </div>
            <div className="mono text-[10px] whitespace-nowrap" style={{ color: "#3d6a7a" }}>{it.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ icon, title, sub, tagText, tagColor, percent, barColor, shimmer }: { icon: string; title: string; sub: string; tagText: string; tagColor: string; percent: number; barColor: string; shimmer?: boolean }) {
  return (
    <div className="rounded-[10px] border border-border p-4 flex flex-col gap-3" style={{ background: "#0e2538" }}>
      <div className="flex items-start justify-between">
        <div className="text-2xl">{icon}</div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: `${tagColor}1a`, color: tagColor }}>{tagText}</span>
      </div>
      <div>
        <div className="font-display font-bold text-sm">{title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mt-auto" style={{ background: "#1a3d58" }}>
        {shimmer ? (
          <div className="h-full shimmer-bar" style={{ width: `${percent}%` }} />
        ) : (
          <div className="h-full rounded-full" style={{ width: `${percent}%`, background: barColor }} />
        )}
      </div>
    </div>
  );
}

function ModulesSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-base">Utbildningsmoduler</h3>
        <button className="text-xs text-muted-foreground hover:text-primary">Se alla →</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ModuleCard icon="🏗" title="Introduktion betong" sub="12 min · 5 steg · Quiz" tagText="27/27 klara" tagColor="#00e096" percent={100} barColor="#00e096" />
        <ModuleCard icon="⚠️" title="Säkerhet & skydd" sub="8 min · 4 steg · Certifiering" tagText="27/27 klara" tagColor="#00e096" percent={100} barColor="#00e096" />
        <ModuleCard icon="📐" title="Ritningsläsning" sub="20 min · 8 steg · Quiz" tagText="19/27 klara" tagColor="#ffd166" percent={70} barColor="#ffd166" />
        <ModuleCard icon="🚜" title="Traverskörning" sub="AI bygger just nu..." tagText="⏳ AI skapar" tagColor="#7dedb8" percent={55} barColor="#7dedb8" shimmer />
        <ModuleCard icon="🔧" title="Gjutning & armering" sub="25 min · 10 steg · Certifiering" tagText="12/27 klara" tagColor="#3d6a7a" percent={44} barColor="#3d6a7a" />
        <div className="rounded-[10px] border border-dashed border-border p-4 flex flex-col items-center justify-center gap-2 text-center" style={{ background: "rgba(125,237,184,0.03)" }}>
          <div className="text-2xl">⏺</div>
          <div className="font-display font-bold text-sm">Ny modul</div>
          <div className="text-[11px] text-muted-foreground">AI bygger automatiskt</div>
          <button className="mt-1 text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>+ Spela in</button>
        </div>
      </div>
    </section>
  );
}
