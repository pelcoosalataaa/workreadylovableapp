import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mobil")({
  component: MobilPage,
});

function MobilPage() {
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
    <div
      className="min-h-screen w-full flex flex-col items-center py-12 px-4"
      style={{
        background:
          "radial-gradient(ellipse at top, #0b1e2d 0%, #060f18 60%), repeating-linear-gradient(0deg, transparent 0, transparent 39px, rgba(125,237,184,0.04) 40px), repeating-linear-gradient(90deg, transparent 0, transparent 39px, rgba(125,237,184,0.04) 40px)",
      }}
    >
      <h2 className="font-display font-bold text-white text-[18px] text-center flex items-center justify-center gap-2" style={{ marginBottom: 24 }}>
        <Smartphone size={20} strokeWidth={1.75} color="#7dedb8" /> Så här ser det ut för din personal
      </h2>

      {/* Phone */}
      <div
        className="overflow-hidden"
        style={{
          width: 390,
          margin: "0 auto",
          background: "#060f18",
          borderRadius: 32,
          border: "1px solid #1a3d58",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 8px #0b1e2d",
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between" style={{ padding: "12px 20px" }}>
          <span className="mono text-[11px] text-white">09:41</span>
          <span className="mono text-[11px]" style={{ color: "#3d6a7a" }}>●●●● 4G 🔋</span>
        </div>

        {/* App header */}
        <div style={{ background: "#7dedb8", padding: "16px 20px" }}>
          <div className="flex items-start gap-3">
            <span className="text-lg font-bold" style={{ color: "#060f18" }}>←</span>
            <div className="flex-1">
              <div className="font-display font-bold text-[16px]" style={{ color: "#060f18" }}>Säkerhet vid gjutning</div>
              <div className="text-[11px]" style={{ color: "rgba(0,0,0,0.6)" }}>Byggelement Ucklum · Modul 3 av 5</div>
            </div>
            <span className="text-[11px] font-bold" style={{ color: "rgba(0,0,0,0.5)" }}>OnboardAI</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: "#0b1e2d", padding: "12px 20px", borderBottom: "1px solid #1a3d58" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-muted-foreground">Framsteg</span>
            <span className="mono text-[11px]" style={{ color: "#7dedb8" }}>Fråga 2 av 4</span>
          </div>
          <div style={{ height: 6, background: "#1a3d58", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "50%", height: "100%", background: "#7dedb8", borderRadius: 3 }} />
          </div>
        </div>

        {/* Scroll content */}
        <div style={{ padding: 20 }}>
          {/* Video card */}
          <div className="overflow-hidden" style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 12, marginBottom: 16 }}>
            <div className="flex flex-col items-center justify-center gap-3" style={{ height: 160, background: "linear-gradient(180deg,#0e2538,#122840)" }}>
              <button className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: "#7dedb8", color: "#060f18", fontSize: 20 }}>▶</button>
              <span className="mono text-[11px]" style={{ color: "#3d6a7a" }}>⏱ 4:32 min</span>
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid #1a3d58" }}>
              <div className="font-bold text-[13px] text-white">Erik visar: Säkerhet vid gjutning</div>
              <div className="text-[11px] text-muted-foreground">Inspelad på plats i fabriken i Ucklum</div>
            </div>
          </div>

          {/* Question card */}
          <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <div className="mono text-[10px] uppercase font-bold" style={{ color: "#7dedb8", marginBottom: 10 }}>Fråga 2 av 4</div>
            <div className="flex items-center justify-center" style={{ width: "100%", height: 80, background: "#122840", border: "1px solid #1a3d58", borderRadius: 8, fontSize: 36, marginBottom: 16 }}>⛑️</div>
            <div className="font-display font-bold text-white text-[17px]" style={{ marginBottom: 20, lineHeight: 1.35 }}>
              Vilken skyddsutrustning MÅSTE du ha på dig innan du börjar gjuta?
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {/* A */}
              <div className="flex items-center gap-3" style={{ padding: "14px 16px", background: "#122840", border: "2px solid #1a3d58", borderRadius: 10 }}>
                <div className="flex items-center justify-center rounded-full mono" style={{ width: 28, height: 28, background: "#1a3d58", color: "#edfaf4", fontSize: 12 }}>A</div>
                <span className="text-[14px] font-medium text-white">Bara skyddshjälm</span>
              </div>
              {/* B selected */}
              <div className="flex items-center gap-3" style={{ padding: "14px 16px", background: "rgba(125,237,184,0.1)", border: "2px solid #7dedb8", borderRadius: 10 }}>
                <div className="flex items-center justify-center rounded-full font-bold" style={{ width: 28, height: 28, background: "#7dedb8", color: "#060f18", fontSize: 14 }}>✓</div>
                <span className="text-[14px] font-medium" style={{ color: "#7dedb8" }}>Hjälm, skyddsglasögon, handskar och skyddsskor</span>
              </div>
              {/* C */}
              <div className="flex items-center gap-3" style={{ padding: "14px 16px", background: "#122840", border: "2px solid #1a3d58", borderRadius: 10 }}>
                <div className="flex items-center justify-center rounded-full mono" style={{ width: 28, height: 28, background: "#1a3d58", color: "#edfaf4", fontSize: 12 }}>C</div>
                <span className="text-[14px] font-medium text-white">Handskar räcker vid kortare arbeten</span>
              </div>
              {/* D */}
              <div className="flex items-center gap-3" style={{ padding: "14px 16px", background: "#122840", border: "2px solid #1a3d58", borderRadius: 10 }}>
                <div className="flex items-center justify-center rounded-full mono" style={{ width: 28, height: 28, background: "#1a3d58", color: "#edfaf4", fontSize: 12 }}>D</div>
                <span className="text-[14px] font-medium text-white">Ingen utrustning behövs inomhus</span>
              </div>
            </div>

            {/* Feedback */}
            <div style={{ background: "rgba(125,237,184,0.1)", border: "1px solid rgba(125,237,184,0.3)", borderRadius: 10, padding: "14px 16px", marginTop: 16 }}>
              <div className="font-bold text-[14px]" style={{ color: "#7dedb8", marginBottom: 4 }}>✅ Rätt!</div>
              <div className="text-[12px] text-muted-foreground" style={{ lineHeight: 1.6 }}>
                All skyddsutrustning krävs alltid vid gjutning. Betong kan orsaka allvarliga kemiska brännskador.
              </div>
            </div>

            {/* Next button */}
            <button
              className="font-display font-bold w-full"
              style={{ marginTop: 16, padding: 16, background: "#7dedb8", color: "#060f18", borderRadius: 10, fontSize: 15 }}
            >
              Nästa fråga →
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .mono { font-family: 'Space Mono', ui-monospace, monospace; letter-spacing: .04em; }
      `}</style>
    </div>
  );
}
