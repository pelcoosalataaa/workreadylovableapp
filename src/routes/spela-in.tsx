import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";

export const Route = createFileRoute("/spela-in")({
  component: SpelaInPage,
});

const momentOptions = ["Välj moment...", "Gjutning", "Armering", "Traverskörning", "Säkerhet", "Ritningsläsning", "Annat"];
const categoryOptions = ["Betong & Prefab", "Verkstad & Industri", "Lager & Logistik", "Bygg & Anläggning"];

type HowStep = { dot: "green" | "mint" | "muted"; mark: string; title: string; desc: string };
const howSteps: HowStep[] = [
  { dot: "green", mark: "✓", title: "Du väljer moment", desc: "Vilket arbetsmoment ska läras ut?" },
  { dot: "green", mark: "✓", title: "Du laddar upp video", desc: "5–10 minuter räcker. AI hanterar resten." },
  { dot: "mint", mark: "", title: "AI transkriberar", desc: "Omvandlar tal till text automatiskt" },
  { dot: "muted", mark: "○", title: "AI skapar steg & quiz", desc: "Strukturerar och bygger utbildningen" },
  { dot: "muted", mark: "○", title: "Personal får SMS", desc: "Länk skickas direkt till ny personal" },
];

const previousModules = [
  { icon: "🏗", title: "Introduktion betong", author: "Erik Svensson", tag: "27/27", color: "#00e096" },
  { icon: "⚠️", title: "Säkerhet & skydd", author: "Anna Berg", tag: "27/27", color: "#00e096" },
  { icon: "📐", title: "Ritningsläsning", author: "Erik Svensson", tag: "19/27", color: "#ffd166" },
];

function SpelaInPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [uploadHover, setUploadHover] = useState(false);
  const uploadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) navigate({ to: "/login" });
      else setReady(true);
    });
    return () => { mounted = false; };
  }, [navigate]);

  if (!ready) return null;

  const cardCls = "rounded-[10px] border border-border p-6";
  const cardStyle = { background: "#0e2538" } as const;
  const selectStyle = {
    background: "#060f18",
    border: "1px solid #1a3d58",
    color: "#edfaf4",
  } as const;

  return (
    <>
      <style>{sidebarKeyframes}</style>
      <AppSidebar />
      <main className="ml-[260px] min-h-screen p-8" style={{ background: "#060f18" }}>
        <header className="mb-6">
          <h1 className="font-display font-bold text-[24px] text-foreground">⏺ Spela in ny modul</h1>
          <p className="text-[13px]" style={{ color: "#3d6a7a" }}>AI guidar dig genom hela inspelningen</p>
        </header>

        <div className="grid gap-6" style={{ gridTemplateColumns: "3fr 2fr" }}>
          {/* LEFT */}
          <div className="flex flex-col gap-5">
            {/* Step 1 */}
            <section className={cardCls} style={cardStyle}>
              <div className="font-mono text-[9px] tracking-wider" style={{ color: "#7dedb8", fontFamily: "'Space Mono', monospace" }}>STEG 1</div>
              <h2 className="font-display font-bold text-[18px] mt-1 mb-4">Välj moment att spela in</h2>
              <label className="text-[11px] uppercase tracking-wider" style={{ color: "#3d6a7a" }}>Moment</label>
              <select className="w-full rounded-md mt-1 mb-4 px-3 py-3 text-sm outline-none" style={selectStyle}>
                {momentOptions.map((o) => <option key={o} style={{ background: "#060f18" }}>{o}</option>)}
              </select>
              <label className="text-[11px] uppercase tracking-wider" style={{ color: "#3d6a7a" }}>Branschkategori</label>
              <select className="w-full rounded-md mt-1 px-3 py-3 text-sm outline-none" style={selectStyle}>
                {categoryOptions.map((o) => <option key={o} style={{ background: "#060f18" }}>{o}</option>)}
              </select>
            </section>

            {/* Step 2 */}
            <section className={cardCls} style={cardStyle}>
              <div className="font-mono text-[9px] tracking-wider" style={{ color: "#7dedb8", fontFamily: "'Space Mono', monospace" }}>STEG 2</div>
              <h2 className="font-display font-bold text-[18px] mt-1 mb-4">Ladda upp din video</h2>
              <div
                ref={uploadRef}
                onMouseEnter={() => setUploadHover(true)}
                onMouseLeave={() => setUploadHover(false)}
                className="rounded-lg text-center transition-all cursor-pointer"
                style={{
                  border: `2px dashed ${uploadHover ? "#7dedb8" : "#1a3d58"}`,
                  padding: "40px",
                  background: uploadHover ? "rgba(125,237,184,0.05)" : "rgba(125,237,184,0.02)",
                }}
              >
                <div style={{ fontSize: 40 }}>📹</div>
                <div className="text-[16px] font-bold text-foreground mt-2">Dra & släpp video här</div>
                <div className="text-[13px] mt-1" style={{ color: "#3d6a7a" }}>
                  Eller filma direkt med din telefon · MP4, MOV · max 500MB
                </div>
              </div>
              <div
                className="mt-4 rounded-md text-[12px]"
                style={{
                  background: "rgba(125,237,184,0.05)",
                  border: "1px solid rgba(125,237,184,0.15)",
                  padding: "12px",
                  color: "#3d6a7a",
                }}
              >
                💡 Tips: Filma det viktigaste momentet. 5–10 minuter räcker. Prata naturligt — AI fixar resten.
              </div>
            </section>

            {/* Step 3 (disabled) */}
            <section className={cardCls} style={{ ...cardStyle, opacity: 0.5 }}>
              <div className="font-mono text-[9px] tracking-wider" style={{ color: "#3d6a7a", fontFamily: "'Space Mono', monospace" }}>STEG 3</div>
              <h2 className="font-display font-bold text-[18px] mt-1 mb-2">AI bygger utbildningen</h2>
              <p className="text-[13px] mb-4" style={{ color: "#3d6a7a" }}>
                Ladda upp din video i steg 2 för att aktivera AI-bearbetningen.
              </p>
              <button
                disabled
                className="w-full rounded-md py-3 font-bold text-sm cursor-not-allowed"
                style={{ background: "#7dedb8", color: "#060f18", opacity: 0.4 }}
              >
                🤖 Låt AI bygga modulen
              </button>
            </section>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5">
            <section className={cardCls} style={cardStyle}>
              <h2 className="font-display font-bold text-[16px] mb-4">Hur det fungerar</h2>
              <ol className="flex flex-col gap-3">
                {howSteps.map((s, i) => {
                  const dotBg =
                    s.dot === "green" ? "#00e096" :
                    s.dot === "mint" ? "#7dedb8" :
                    "transparent";
                  const dotBorder = s.dot === "muted" ? "1px solid #3d6a7a" : "none";
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{
                          width: 20, height: 20, borderRadius: 999,
                          background: dotBg,
                          border: dotBorder,
                          color: "#060f18",
                          animation: s.dot === "mint" ? "pulseDot 1.4s ease-in-out infinite" : undefined,
                        }}
                      >
                        {s.mark}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-foreground">{s.title}</div>
                        <div className="text-[12px]" style={{ color: "#3d6a7a" }}>{s.desc}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="my-5 h-px" style={{ background: "#1a3d58" }} />
              <div className="grid grid-cols-3 text-center">
                {[
                  { v: "5 min", l: "Inspelningstid" },
                  { v: "30 sek", l: "AI-bearbetning" },
                  { v: "Dag 0", l: "Personal redo" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-display font-bold text-[18px]" style={{ color: "#7dedb8" }}>{s.v}</div>
                    <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "#3d6a7a" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[10px] border border-border p-5" style={cardStyle}>
              <h2 className="font-display font-bold text-[14px] mb-3">Tidigare moduler</h2>
              <div className="flex flex-col gap-2">
                {previousModules.map((m) => (
                  <div key={m.title} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className="text-[18px]">{m.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-foreground truncate">{m.title}</div>
                      <div className="text-[11px]" style={{ color: "#3d6a7a" }}>{m.author}</div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded"
                      style={{
                        background: `${m.color}1a`,
                        color: m.color,
                        border: `1px solid ${m.color}33`,
                      }}
                    >
                      {m.tag}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
