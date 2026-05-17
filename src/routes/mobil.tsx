import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type QuizQ = { fraga: string; ratt_svar: number; alternativ: string[] };
type Modul = { id: string; titel: string; steg: string[]; quiz: QuizQ[] };

export const Route = createFileRoute("/mobil")({
  component: MobilPage,
  validateSearch: (s: Record<string, unknown>) => ({
    personal: typeof s.personal === "string" ? s.personal : undefined,
  }),
});

function MobilPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modul, setModul] = useState<Modul | null>(null);

  const [phase, setPhase] = useState<"steg" | "quiz" | "klar">("steg");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("moduler")
        .select("id, titel, steg, quiz")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setModul({
          id: data.id,
          titel: data.titel,
          steg: Array.isArray(data.steg) ? (data.steg as string[]) : [],
          quiz: Array.isArray(data.quiz) ? (data.quiz as unknown as QuizQ[]) : [],
        });
      }
      setLoading(false);
    })();
  }, []);

  const total = modul?.quiz.length ?? 0;
  const current = modul?.quiz[qIndex];
  const progress = useMemo(() => {
    if (phase === "steg") return 0;
    if (phase === "klar") return 100;
    return total > 0 ? ((qIndex + (selected !== null ? 1 : 0)) / total) * 100 : 0;
  }, [phase, qIndex, selected, total]);

  function resetQuiz() {
    setPhase("steg");
    setQIndex(0);
    setSelected(null);
    setCorrectCount(0);
  }

  function handleAnswer(i: number) {
    if (selected !== null || !current) return;
    setSelected(i);
    if (i === current.ratt_svar) setCorrectCount((c) => c + 1);
  }

  function handleNext() {
    if (!modul) return;
    if (qIndex + 1 >= total) {
      setPhase("klar");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  }

  const passed = total > 0 && correctCount / total >= 0.75;

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "#060f18", color: "#edfaf4" }}
    >
      {/* Header */}
      <div style={{ background: "#7dedb8", padding: "16px 20px" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            style={{ background: "transparent", border: "none", color: "#060f18", fontSize: 20, fontWeight: 700, cursor: "pointer" }}
            aria-label="Tillbaka"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <div className="font-display font-bold" style={{ color: "#060f18", fontSize: 16, fontFamily: "Syne, sans-serif" }}>
              {loading ? "Laddar…" : modul?.titel ?? "Ingen modul"}
            </div>
            <div style={{ color: "rgba(0,0,0,0.6)", fontSize: 11 }}>WorkReady · Modul</div>
          </div>
          <div style={{ width: 20 }} />
        </div>
      </div>

      {/* Progress */}
      {modul && total > 0 && (
        <div style={{ padding: "10px 20px", background: "#0b1e2d", borderBottom: "1px solid #1a3d58" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#3d6a7a" }}>
              {phase === "quiz" ? `Fråga ${qIndex + 1} av ${total}` : phase === "klar" ? "Klar" : "Genomgång"}
            </span>
            <span style={{ fontSize: 11, color: "#7dedb8", fontFamily: "Space Mono, monospace" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 6, background: "#1a3d58", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#7dedb8", transition: "width .2s" }} />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 20, maxWidth: 560, width: "100%", margin: "0 auto" }}>
        {loading && <div style={{ color: "#3d6a7a", textAlign: "center", marginTop: 40 }}>Laddar…</div>}

        {!loading && !modul && (
          <div style={{ textAlign: "center", marginTop: 60, padding: 24, background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 12, color: "#edfaf4", fontSize: 14 }}>
            Ingen utbildning tillgänglig just nu. Kontakta din chef.
          </div>
        )}

        {!loading && modul && phase === "steg" && (
          <div className="flex flex-col" style={{ gap: 12 }}>
            {modul.steg.map((s, i) => (
              <div key={i} className="flex items-start gap-3" style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 12, padding: 14 }}>
                <div className="flex items-center justify-center shrink-0" style={{ width: 32, height: 32, borderRadius: 16, background: "#7dedb8", color: "#060f18", fontWeight: 700, fontSize: 14 }}>
                  {i + 1}
                </div>
                <div style={{ color: "#ffffff", fontSize: 14, lineHeight: 1.5 }}>{s}</div>
              </div>
            ))}
            {total > 0 && (
              <button
                onClick={() => setPhase("quiz")}
                className="font-display font-bold w-full"
                style={{ marginTop: 12, padding: 16, background: "#7dedb8", color: "#060f18", borderRadius: 10, fontSize: 15, border: "none", cursor: "pointer" }}
              >
                Starta quiz →
              </button>
            )}
          </div>
        )}

        {!loading && modul && phase === "quiz" && current && (
          <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 16, padding: 20 }}>
            <div style={{ color: "#7dedb8", fontSize: 10, fontFamily: "Space Mono, monospace", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
              Fråga {qIndex + 1} av {total}
            </div>
            <div className="font-display font-bold" style={{ color: "#ffffff", fontSize: 17, fontFamily: "Syne, sans-serif", marginBottom: 18, lineHeight: 1.35 }}>
              {current.fraga}
            </div>

            <div className="flex flex-col" style={{ gap: 10 }}>
              {current.alternativ.map((opt, i) => {
                const isCorrect = i === current.ratt_svar;
                const isPicked = selected === i;
                let bg = "#122840";
                let border = "2px solid #1a3d58";
                let color = "#ffffff";
                if (selected !== null) {
                  if (isPicked && isCorrect) {
                    bg = "rgba(0,224,150,0.2)"; border = "2px solid #00e096"; color = "#00e096";
                  } else if (isPicked && !isCorrect) {
                    bg = "rgba(255,77,106,0.2)"; border = "2px solid #ff4d6a"; color = "#ff4d6a";
                  } else if (!isPicked && isCorrect) {
                    bg = "rgba(0,224,150,0.2)"; border = "2px solid #00e096"; color = "#00e096";
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    style={{ textAlign: "left", padding: "14px 16px", background: bg, border, borderRadius: 10, color, fontSize: 14, fontWeight: 500, cursor: selected !== null ? "default" : "pointer" }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: selected === current.ratt_svar ? "#00e096" : "#ff4d6a" }}>
                {selected === current.ratt_svar
                  ? "✅ Rätt!"
                  : `❌ Fel! Rätt svar: ${current.alternativ[current.ratt_svar]}`}
              </div>
            )}

            {selected !== null && (
              <button
                onClick={handleNext}
                className="font-display font-bold w-full"
                style={{ marginTop: 16, padding: 16, background: "#7dedb8", color: "#060f18", borderRadius: 10, fontSize: 15, border: "none", cursor: "pointer" }}
              >
                {qIndex + 1 >= total ? "Se resultat →" : "Nästa fråga →"}
              </button>
            )}
          </div>
        )}

        {!loading && modul && phase === "klar" && (
          <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 16, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#3d6a7a", marginBottom: 8 }}>
              {correctCount} av {total} rätt
            </div>
            {passed ? (
              <div className="font-display font-bold" style={{ color: "#00e096", fontSize: 18, fontFamily: "Syne, sans-serif" }}>
                ✅ Godkänd! Certifikat sparat.
              </div>
            ) : (
              <>
                <div className="font-display font-bold" style={{ color: "#ff4d6a", fontSize: 18, fontFamily: "Syne, sans-serif", marginBottom: 16 }}>
                  ❌ Försök igen
                </div>
                <button
                  onClick={resetQuiz}
                  className="font-display font-bold w-full"
                  style={{ padding: 14, background: "#7dedb8", color: "#060f18", borderRadius: 10, fontSize: 15, border: "none", cursor: "pointer" }}
                >
                  Gör om quiz
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
