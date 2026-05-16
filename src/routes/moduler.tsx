import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";

export const Route = createFileRoute("/moduler")({
  component: ModulerPage,
});

type Category = "Betong & Prefab" | "Säkerhet" | "Maskiner";
type TagColor = "green" | "yellow" | "mint" | "muted";

type Module = {
  icon: string;
  iconBg: string;
  title: string;
  meta: string;
  tagText: string;
  tagColor: TagColor;
  percent: number;
  barColor: string;
  category: Category;
  building?: boolean;
};

const modules: Module[] = [
  { icon: "🏗", iconBg: "rgba(125,237,184,0.1)", title: "Introduktion betong", meta: "12 min · 5 steg · Quiz · Inspelad av Erik Svensson", tagText: "27/27 klara", tagColor: "green", percent: 100, barColor: "#00e096", category: "Betong & Prefab" },
  { icon: "⚠️", iconBg: "rgba(255,77,106,0.1)", title: "Säkerhet & skydd", meta: "8 min · 4 steg · Certifiering · Inspelad av Anna Berg", tagText: "27/27 klara", tagColor: "green", percent: 100, barColor: "#00e096", category: "Säkerhet" },
  { icon: "📐", iconBg: "rgba(56,182,255,0.1)", title: "Ritningsläsning", meta: "20 min · 8 steg · Quiz · Inspelad av Erik Svensson", tagText: "19/27 klara", tagColor: "yellow", percent: 70, barColor: "#ffd166", category: "Betong & Prefab" },
  { icon: "🚜", iconBg: "rgba(125,237,184,0.08)", title: "Traverskörning", meta: "AI bygger just nu... · Inspelad av Erik Svensson", tagText: "⏳ AI skapar", tagColor: "mint", percent: 65, barColor: "#7dedb8", category: "Maskiner", building: true },
  { icon: "🔧", iconBg: "rgba(255,209,102,0.1)", title: "Gjutning & armering", meta: "25 min · 10 steg · Certifiering · Inspelad av Erik Svensson", tagText: "12/27 klara", tagColor: "muted", percent: 44, barColor: "#3d6a7a", category: "Betong & Prefab" },
];

const filters = ["Alla moduler", "Betong & Prefab", "Säkerhet", "Maskiner", "AI skapar"] as const;
type Filter = typeof filters[number];

const tagStyles: Record<TagColor, React.CSSProperties> = {
  green: { background: "rgba(0,224,150,0.1)", color: "#00e096", border: "1px solid rgba(0,224,150,0.2)" },
  yellow: { background: "rgba(255,209,102,0.1)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.2)" },
  mint: { background: "rgba(125,237,184,0.12)", color: "#7dedb8", border: "1px solid rgba(125,237,184,0.3)" },
  muted: { background: "rgba(61,106,122,0.15)", color: "#3d6a7a", border: "1px solid #1a3d58" },
};

function ModulerPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("Alla moduler");

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

  const visible = useMemo(() => {
    if (filter === "Alla moduler") return modules;
    if (filter === "AI skapar") return modules.filter((m) => m.building);
    return modules.filter((m) => m.category === filter);
  }, [filter]);

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <main className="px-8 py-7 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-[24px] text-white">🎬 Utbildningsmoduler</h1>
              <p className="text-sm text-muted-foreground mt-1">Byggelement Ucklum · 5 aktiva moduler</p>
            </div>
            <button className="text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>⏺ Spela in ny modul</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard color="#7dedb8" label="AKTIVA MODULER" value="5" />
            <StatCard color="#00e096" label="PERSONAL GODKÄNDA" value="127" />
            <StatCard color="#ffd166" label="UNDER UPPLÄRNING" value="23" />
          </div>

          {/* Filters */}
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
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 gap-4">
            {visible.map((m) => (
              <ModuleCard key={m.title} m={m} />
            ))}
            <RecordCard />
          </div>
        </main>
      </div>
      <style>{sidebarKeyframes}{`
        .mod-card{transition:transform .2s, border-color .2s, box-shadow .2s; position:relative; overflow:hidden}
        .mod-card::before{content:""; position:absolute; top:0; left:0; right:0; height:2px; background:#7dedb8; opacity:0; transition:opacity .2s}
        .mod-card:hover{border-color:rgba(125,237,184,0.3) !important; transform:translateY(-3px)}
        .mod-card:hover::before{opacity:1}
        @keyframes barPulse { 0%,100%{width:60%} 50%{width:75%} }
        .ai-bar{animation:barPulse 2s ease-in-out infinite}
        .ghost-btn{font-size:11px; padding:5px 10px; border:1px solid #1a3d58; border-radius:6px; color:#edfaf4; background:transparent; transition:background .15s}
        .ghost-btn:hover:not(:disabled){background:rgba(125,237,184,0.06); border-color:rgba(125,237,184,0.3)}
        .ghost-btn:disabled{opacity:.4; cursor:not-allowed}
      `}</style>
    </div>
  );
}

function StatCard({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-border p-5" style={{ background: "#0b1e2d" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} />
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${color}22, transparent 70%)` }} />
      <div className="mono text-[9px] font-bold text-muted-foreground">{label}</div>
      <div className="font-display font-bold text-[46px] leading-none mt-2" style={{ color }}>{value}</div>
    </div>
  );
}

function ModuleCard({ m }: { m: Module }) {
  return (
    <div className="mod-card rounded-[10px] flex flex-col gap-3" style={{ background: "#0e2538", border: "1px solid #1a3d58", padding: 20 }}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-md flex items-center justify-center text-lg" style={{ background: m.iconBg }}>{m.icon}</div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${m.building ? "mint-pulse" : ""}`} style={tagStyles[m.tagColor]}>{m.tagText}</span>
      </div>
      <div>
        <h3 className="font-display font-bold text-[15px] text-white">{m.title}</h3>
        <p className="text-[11px] text-muted-foreground mt-1">{m.meta}</p>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1a3d58" }}>
        {m.building ? (
          <div className="ai-bar h-full shimmer-bar rounded-full" />
        ) : (
          <div className="h-full rounded-full" style={{ width: `${m.percent}%`, background: m.barColor }} />
        )}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.04)", color: "#3d6a7a", border: "1px solid #1a3d58" }}>{m.category}</span>
        <button className="ghost-btn" disabled={m.building}>{m.building ? "Bygger..." : "Redigera"}</button>
      </div>
    </div>
  );
}

function RecordCard() {
  return (
    <a href="/spela-in" className="rounded-[10px] flex flex-col items-center justify-center gap-3 text-center transition hover:border-[rgba(125,237,184,0.4)]" style={{ background: "transparent", border: "1.5px dashed #1a3d58", padding: 20, minHeight: 220 }}>
      <div className="text-[32px]">⏺</div>
      <div>
        <div className="font-display font-bold text-[15px] text-white">Spela in ny modul</div>
        <div className="text-[11px] text-muted-foreground mt-1">AI bygger utbildningen automatiskt</div>
      </div>
      <span className="text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>+ Spela in</span>
    </a>
  );
}
