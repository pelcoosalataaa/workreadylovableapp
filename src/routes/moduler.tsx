import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { AppModal, Field, TextInput, SelectInput, GhostBtn, MintBtn } from "@/components/AppModal";
import { toast } from "sonner";
import { Video, CircleDot, Layers, ShieldAlert, FileText, MoveUp, Hammer, PlusCircle, Bot, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/moduler")({
  component: ModulerPage,
});

type Category = "Betong & Prefab" | "Säkerhet" | "Maskiner";
type TagColor = "green" | "yellow" | "mint" | "muted";

type Module = {
  id?: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  meta: string;
  tagText: string;
  tagColor: TagColor;
  tagPrefixIcon?: LucideIcon;
  percent: number;
  barColor: string;
  category: Category;
  building?: boolean;
};

const modules: Module[] = [
  { Icon: Layers, iconColor: "#7dedb8", iconBg: "rgba(125,237,184,0.1)", title: "Introduktion betong", meta: "12 min · 5 steg · Quiz · Inspelad av Erik Svensson", tagText: "27/27 klara", tagColor: "green", percent: 100, barColor: "#00e096", category: "Betong & Prefab" },
  { Icon: ShieldAlert, iconColor: "#ff4d6a", iconBg: "rgba(255,77,106,0.1)", title: "Säkerhet & skydd", meta: "8 min · 4 steg · Certifiering · Inspelad av Anna Berg", tagText: "27/27 klara", tagColor: "green", percent: 100, barColor: "#00e096", category: "Säkerhet" },
  { Icon: FileText, iconColor: "#60b0f4", iconBg: "rgba(56,182,255,0.1)", title: "Ritningsläsning", meta: "20 min · 8 steg · Quiz · Inspelad av Erik Svensson", tagText: "19/27 klara", tagColor: "yellow", percent: 70, barColor: "#ffd166", category: "Betong & Prefab" },
  { Icon: MoveUp, iconColor: "#7dedb8", iconBg: "rgba(125,237,184,0.08)", title: "Traverskörning", meta: "AI bygger just nu... · Inspelad av Erik Svensson", tagText: "AI skapar", tagColor: "mint", tagPrefixIcon: Bot, percent: 65, barColor: "#7dedb8", category: "Maskiner", building: true },
  { Icon: Hammer, iconColor: "#ffd166", iconBg: "rgba(255,209,102,0.1)", title: "Gjutning & armering", meta: "25 min · 10 steg · Certifiering · Inspelad av Erik Svensson", tagText: "12/27 klara", tagColor: "muted", percent: 44, barColor: "#3d6a7a", category: "Betong & Prefab" },
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

  const [dbModules, setDbModules] = useState<Module[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      const { data, error } = await supabase
        .from("moduler")
        .select("id, titel, kategori, skapad_av, created_at")
        .order("created_at", { ascending: false });
      if (!error && data) {
        const mapped: Module[] = data.map((r) => {
          const cat = (["Betong & Prefab", "Säkerhet", "Maskiner"] as const).includes(r.kategori as Category)
            ? (r.kategori as Category)
            : "Betong & Prefab";
          const dateStr = new Date(r.created_at).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" });
          return {
            id: r.id,
            Icon: Layers,
            iconColor: "#7dedb8",
            iconBg: "rgba(125,237,184,0.1)",
            title: r.titel,
            meta: `${dateStr} · Skapad av: ${r.skapad_av ?? "Okänd"}`,
            tagText: "Ny",
            tagColor: "green",
            percent: 100,
            barColor: "#00e096",
            category: cat,
          };
        });
        setDbModules(mapped);
      }
      setLoadingDb(false);
    })();
  }, [ready]);

  const allModules = useMemo(() => [...dbModules, ...modules], [dbModules]);

  const visible = useMemo(() => {
    if (filter === "Alla moduler") return allModules;
    if (filter === "AI skapar") return allModules.filter((m) => m.building);
    return allModules.filter((m) => m.category === filter);
  }, [filter, allModules]);

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <main className="px-8 py-7 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-[24px] text-white flex items-center gap-2"><Video size={22} strokeWidth={1.75} color="#7dedb8" /> Utbildningsmoduler</h1>
              <p className="text-sm text-muted-foreground mt-1">Byggelement Ucklum · 5 aktiva moduler</p>
            </div>
            <button onClick={() => navigate({ to: "/spela-in" })} className="text-xs font-bold px-3 py-2 rounded-md inline-flex items-center gap-1.5" style={{ background: "#7dedb8", color: "#060f18" }}><CircleDot size={14} strokeWidth={1.75} /> Spela in ny modul</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard color="#60b0f4" label="AKTIVA MODULER" value="5" />
            <StatCard color="#7dedb8" label="PERSONAL GODKÄNDA" value="127" />
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
            {loadingDb && (
              <div className="col-span-3 text-[12px] text-muted-foreground">Laddar moduler...</div>
            )}
            {visible.map((m, i) => (
              <ModuleCard key={`${m.title}-${i}`} m={m} />
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
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [namn, setNamn] = useState(m.title);
  const [kat, setKat] = useState<string>(m.category);

  const onCardClick = () => {
    if (m.building) return;
    if (m.id) navigate({ to: "/modul/$id", params: { id: m.id } });
  };

  const save = () => {
    toast.success("Modul sparad!");
    setEditOpen(false);
  };

  return (
    <>
      <div onClick={onCardClick} className="mod-card rounded-[10px] flex flex-col gap-3" style={{ background: "#0e2538", border: "1px solid #1a3d58", padding: 20, cursor: m.id && !m.building ? "pointer" : "default" }}>
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: m.iconBg }}><m.Icon size={20} strokeWidth={1.75} color={m.iconColor} /></div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 ${m.building ? "mint-pulse" : ""}`} style={tagStyles[m.tagColor]}>{m.tagPrefixIcon ? <m.tagPrefixIcon size={12} strokeWidth={1.75} /> : null}{m.tagText}</span>
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
          <button className="ghost-btn" disabled={m.building} onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}>{m.building ? "Bygger..." : "Redigera"}</button>
        </div>
      </div>
      <AppModal open={editOpen} onClose={() => setEditOpen(false)} title="Redigera modul" footer={
        <>
          <GhostBtn onClick={() => setEditOpen(false)}>Avbryt</GhostBtn>
          <MintBtn onClick={save}>Spara</MintBtn>
        </>
      }>
        <Field label="Modulnamn"><TextInput value={namn} onChange={(e) => setNamn(e.target.value)} /></Field>
        <Field label="Kategori"><SelectInput options={["Betong & Prefab", "Säkerhet", "Maskiner"]} value={kat} onChange={(e) => setKat(e.target.value)} /></Field>
      </AppModal>
    </>
  );
}

function RecordCard() {
  return (
    <a href="/spela-in" className="rounded-[10px] flex flex-col items-center justify-center gap-3 text-center transition hover:border-[rgba(125,237,184,0.4)]" style={{ background: "transparent", border: "1.5px dashed #1a3d58", padding: 20, minHeight: 220 }}>
      <PlusCircle size={28} strokeWidth={1.5} color="#7dedb8" />
      <div>
        <div className="font-display font-bold text-[15px] text-white">Spela in ny modul</div>
        <div className="text-[11px] text-muted-foreground mt-1">AI bygger utbildningen automatiskt</div>
      </div>
      <span className="text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>+ Spela in</span>
    </a>
  );
}
