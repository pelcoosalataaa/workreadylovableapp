import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { Grid3x3, Layers } from "lucide-react";

export const Route = createFileRoute("/kompetensmatris")({
  component: KompetensmatrisPage,
});

type Cell = "ok" | "wip" | "none";

type Row = {
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  role: string;
  company: string;
  cells: Cell[];
  certs: { label: string; tone: "ok" | "bad" }[];
};

const rows: Row[] = [
  {
    initials: "AJ", avatarBg: "rgba(0,224,150,0.15)", avatarColor: "#00e096",
    name: "Anders Johansson", role: "Gjutare · Dag", company: "Byggelement AB",
    cells: ["ok", "ok", "ok", "ok", "ok"],
    certs: [{ label: "✓ Betongkurs", tone: "ok" }, { label: "✓ Traverskort", tone: "ok" }],
  },
  {
    initials: "PL", avatarBg: "rgba(125,237,184,0.15)", avatarColor: "#7dedb8",
    name: "Petter Lindgren", role: "Gjutare · Kväll", company: "Partner2Work",
    cells: ["wip", "ok", "ok", "wip", "ok"],
    certs: [{ label: "✓ Betongkurs", tone: "ok" }],
  },
  {
    initials: "SB", avatarBg: "rgba(255,77,106,0.15)", avatarColor: "#ff4d6a",
    name: "Sara Berg", role: "Gjutare · Dag", company: "Partner2Work",
    cells: ["none", "none", "none", "none", "none"],
    certs: [{ label: "✗ Betongkurs saknas", tone: "bad" }],
  },
];

const competencyHeaders = ["Gjutning", "Vibrering", "Avjämning", "Ritningsläsning", "Säkerhet"];

function cellStyle(c: Cell): React.CSSProperties {
  if (c === "ok") return { background: "rgba(0,224,150,0.12)", color: "#00e096", border: "1px solid rgba(0,224,150,0.25)" };
  if (c === "wip") return { background: "rgba(255,209,102,0.12)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.25)" };
  return { background: "rgba(26,61,88,0.5)", color: "#3d6a7a", border: "1px solid rgba(26,61,88,0.8)" };
}

function cellGlyph(c: Cell): string {
  if (c === "ok") return "✓";
  if (c === "wip") return "⏳";
  return "—";
}

const selectStyle: React.CSSProperties = {
  background: "#060f18",
  border: "1px solid #1a3d58",
  color: "#fff",
  padding: "9px 12px",
  borderRadius: 6,
  fontSize: 12,
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', ui-monospace, monospace",
  fontSize: 9,
  letterSpacing: "0.08em",
  color: "#3d6a7a",
  textTransform: "uppercase",
  fontWeight: 700,
  marginBottom: 6,
  display: "block",
};

function KompetensmatrisPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(true);

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

  const summaryCoverage = ["Täckningsgrad", "67%", "100%", "100%", "67%", "100%"];
  const summaryColors = ["#3d6a7a", "#ffd166", "#00e096", "#00e096", "#ffd166", "#00e096"];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <main className="px-8 py-7 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-[24px] text-white flex items-center gap-2"><Grid3x3 size={22} strokeWidth={1.75} color="#7dedb8" /> Kompetensmatris</h1>
              <p className="text-sm text-muted-foreground mt-1">Byggelement Ucklum · Branschsorterad kompetensöversikt</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-semibold px-3 py-2 rounded-md" style={{ background: "transparent", border: "1px solid #1a3d58", color: "#edfaf4" }}>⬇ Exportera</button>
              <button className="text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>+ Lägg till kompetens</button>
            </div>
          </div>

          {/* Filter card */}
          <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 10, padding: 20 }}>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <span style={labelStyle}>Bransch</span>
                <select style={selectStyle} defaultValue="alla">
                  <option value="alla">Alla branscher</option>
                  <option>Betong & Prefab</option>
                  <option>⚙️ Verkstad & Industri</option>
                  <option>Lager & Logistik</option>
                  <option>🔨 Bygg & Anläggning</option>
                </select>
              </div>
              <div>
                <span style={labelStyle}>Avdelning</span>
                <select style={selectStyle} defaultValue="alla">
                  <option value="alla">Alla avdelningar</option>
                  <option>Gjutavdelningen</option>
                  <option>Armeringsavdelningen</option>
                  <option>Lager & Utskeppning</option>
                  <option>CNC-produktion</option>
                  <option>Montering</option>
                </select>
              </div>
              <div>
                <span style={labelStyle}>Sök person</span>
                <input style={selectStyle} placeholder="🔍 Namn eller roll..." />
              </div>
              <div>
                <span style={labelStyle}>Sammanfattning</span>
                <div className="flex items-center gap-4" style={{ padding: "6px 0" }}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-white text-[18px]">23</span>
                    <span className="text-[10px] text-muted-foreground">Personal</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-[18px]" style={{ color: "#00e096" }}>16</span>
                    <span className="text-[10px] text-muted-foreground">Godkända</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-[18px]" style={{ color: "#ffd166" }}>5</span>
                    <span className="text-[10px] text-muted-foreground">Pågår</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-[18px]" style={{ color: "#ff4d6a" }}>2</span>
                    <span className="text-[10px] text-muted-foreground">Ej start</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs" style={{ marginBottom: 20 }}>
            <span style={{ color: "#7dedb8" }}>Byggelement AB</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-muted-foreground">Alla avdelningar</span>
          </div>

          {/* Industry section */}
          <div>
            <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #1a3d58" }}>
              <div className="flex items-center justify-center" style={{ width: 40, height: 40, background: "rgba(125,237,184,0.1)", borderRadius: 8 }}><Layers size={20} strokeWidth={1.75} color="#7dedb8" /></div>
              <div>
                <div className="font-display font-bold text-white text-[20px]">Betong & Prefab</div>
                <div className="text-[12px] text-muted-foreground">Byggelement AB · Thomas Betong · SF Marina</div>
              </div>
              <div className="ml-auto flex items-center gap-5">
                <div className="flex items-baseline gap-1.5"><span className="font-display font-bold text-[18px]" style={{ color: "#7dedb8" }}>8</span><span className="text-[10px] text-muted-foreground">Personal</span></div>
                <div className="flex items-baseline gap-1.5"><span className="font-display font-bold text-[18px]" style={{ color: "#00e096" }}>6</span><span className="text-[10px] text-muted-foreground">Godkända</span></div>
                <div className="flex items-baseline gap-1.5"><span className="font-display font-bold text-[18px]" style={{ color: "#ffd166" }}>2</span><span className="text-[10px] text-muted-foreground">Pågår</span></div>
              </div>
            </div>

            {/* Department */}
            <div>
              <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-3 text-left"
                style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: "10px 10px 0 0", padding: "14px 20px", cursor: "pointer" }}
              >
                <div className="flex items-center justify-center text-base shrink-0" style={{ width: 36, height: 36, background: "rgba(125,237,184,0.1)", borderRadius: 8 }}>🪣</div>
                <div>
                  <div className="font-display font-bold text-white text-[16px]">Gjutavdelningen</div>
                  <div className="text-[11px] text-muted-foreground">Gjutning · Vibrering · Avjämning</div>
                </div>
                <div className="ml-auto flex items-center gap-3 text-[11px] font-bold">
                  <span style={{ color: "#00e096" }}>4 Godkända</span>
                  <span style={{ color: "#ffd166" }}>1 Pågår</span>
                  <span style={{ color: "#ff4d6a" }}>1 Ej start</span>
                  <span className="px-2 py-1 rounded-full" style={{ background: "rgba(125,237,184,0.12)", color: "#7dedb8", border: "1px solid rgba(125,237,184,0.25)" }}>6 pers</span>
                  <span className="text-muted-foreground ml-2">{open ? "▼" : "▶"}</span>
                </div>
              </button>

              {open && (
                <div style={{ background: "#0b1e2d", border: "1px solid #1a3d58", borderTop: "none", borderRadius: "0 0 10px 10px" }}>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                        <th className="mono text-left font-bold uppercase" style={{ color: "#3d6a7a", fontSize: 9, padding: "10px 14px" }}>Person</th>
                        {competencyHeaders.map((h) => (
                          <th key={h} className="mono text-center font-bold uppercase" style={{ color: "#3d6a7a", fontSize: 9, padding: "10px 14px" }}>{h}</th>
                        ))}
                        <th className="mono text-left font-bold uppercase" style={{ color: "#3d6a7a", fontSize: 9, padding: "10px 14px" }}>Certifikat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.initials} style={{ borderBottom: "1px solid rgba(26,61,88,0.4)" }}>
                          <td style={{ padding: "12px 14px" }}>
                            <div className="flex items-center gap-3">
                              <div className="rounded-full flex items-center justify-center font-bold text-[11px] shrink-0" style={{ width: 34, height: 34, background: r.avatarBg, color: r.avatarColor }}>{r.initials}</div>
                              <div>
                                <div className="text-[13px] font-bold">{r.name}</div>
                                <div className="text-[11px] text-muted-foreground">{r.role}</div>
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(125,237,184,0.1)", color: "#7dedb8" }}>{r.company}</span>
                              </div>
                            </div>
                          </td>
                          {r.cells.map((c, i) => (
                            <td key={i} style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div className="inline-flex items-center justify-center rounded-full font-bold text-[12px]" style={{ width: 28, height: 28, ...cellStyle(c) }}>{cellGlyph(c)}</div>
                            </td>
                          ))}
                          <td style={{ padding: "12px 14px" }}>
                            <div className="flex flex-wrap gap-1.5">
                              {r.certs.map((c, i) => (
                                <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-full" style={c.tone === "ok"
                                  ? { background: "rgba(0,224,150,0.1)", color: "#00e096", border: "1px solid rgba(0,224,150,0.2)" }
                                  : { background: "rgba(255,77,106,0.1)", color: "#ff4d6a", border: "1px solid rgba(255,77,106,0.2)" }}>{c.label}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: "rgba(0,0,0,0.15)" }}>
                        {summaryCoverage.map((v, i) => (
                          <td key={i} className="mono" style={{ padding: "10px 14px", fontSize: 10, color: summaryColors[i], textAlign: i === 0 ? "left" : "center", fontWeight: 700 }}>{v}</td>
                        ))}
                        <td />
                      </tr>
                    </tbody>
                  </table>

                  {/* Legend */}
                  <div className="flex items-center gap-5" style={{ padding: "10px 16px", background: "rgba(0,0,0,0.15)", fontSize: 11, color: "#3d6a7a", borderTop: "1px solid rgba(26,61,88,0.4)" }}>
                    <span>✓ Godkänd</span>
                    <span>⏳ Pågår</span>
                    <span>— Saknas</span>
                    <span className="ml-auto">⚠ = Certifikat utgår snart</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add department */}
          <button
            className="w-full text-center text-xs transition-colors"
            style={{ border: "1px dashed #1a3d58", borderRadius: 10, padding: 16, color: "#3d6a7a", background: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7dedb8"; e.currentTarget.style.color = "#7dedb8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a3d58"; e.currentTarget.style.color = "#3d6a7a"; }}
          >
            + Lägg till ny avdelning under Betong & Prefab
          </button>
        </main>
      </div>
      <style>{sidebarKeyframes}</style>
    </div>
  );
}
