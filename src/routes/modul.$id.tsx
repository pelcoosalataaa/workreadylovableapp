import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell } from "@/components/LightAppShell";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/modul/$id")({
  component: ModulDetailPage,
});

type Quiz = { fraga: string; alternativ: string[]; ratt_svar?: number; ratt?: number };
type Steg = { rubrik?: string; text?: string } | string;

function ModulDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<{ titel: string; steg: Steg[]; quiz: Quiz[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});

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

  useEffect(() => {
    if (!ready) return;
    (async () => {
      const { data: row } = await supabase
        .from("moduler")
        .select("titel, steg, quiz")
        .eq("id", id)
        .maybeSingle();
      if (row) {
        setData({
          titel: row.titel,
          steg: (row.steg as unknown as Steg[]) ?? [],
          quiz: (row.quiz as unknown as Quiz[]) ?? [],
        });
      }
      setLoading(false);
    })();
  }, [ready, id]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

  return (
    <LightAppShell
      title="Utbildning & Onboarding"
      action={
        <Link
          to="/utbildning"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
            padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#374151",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Tillbaka
        </Link>
      }
    >
      {loading && <div style={{ fontSize: 13, color: "#6b7280" }}>Laddar modul...</div>}

      {!loading && !data && (
        <div style={{ background: "#fff", borderRadius: 10, padding: 24, fontSize: 13, color: "#6b7280", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          Modulen kunde inte hittas.
        </div>
      )}

      {data && (
        <>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 24, color: "#111827", margin: 0 }}>
            {data.titel}
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
            {/* Steg */}
            <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 16 }}>Steg</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {data.steg.length === 0 && <div style={{ fontSize: 12, color: "#6b7280" }}>Inga steg.</div>}
                {data.steg.map((s, i) => {
                  const rubrik = typeof s === "string" ? "" : s.rubrik;
                  const text = typeof s === "string" ? s : s.text;
                  return (
                    <div key={i} style={{ display: "flex", gap: 12 }}>
                      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: "#0b1e2d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {rubrik && <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 4 }}>{rubrik}</div>}
                        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiz */}
            <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 16 }}>Quiz</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {data.quiz.length === 0 && <div style={{ fontSize: 12, color: "#6b7280" }}>Inga frågor.</div>}
                {data.quiz.map((q, qi) => {
                  const picked = answers[qi];
                  const answered = picked !== undefined;
                  const correctIdx = Number(q.ratt_svar ?? q.ratt);
                  return (
                    <div key={qi}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 8 }}>
                        {qi + 1}. {q.fraga}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.alternativ.map((alt, ai) => {
                          const isCorrect = ai === correctIdx;
                          const isPicked = picked === ai;
                          let bg = "#fff";
                          let border = "1px solid #e5e7eb";
                          let color = "#374151";
                          if (answered) {
                            if (isCorrect) { bg = "#d1fae5"; border = "1px solid #10b981"; color = "#065f46"; }
                            else if (isPicked) { bg = "#fee2e2"; border = "1px solid #ef4444"; color = "#991b1b"; }
                          }
                          return (
                            <button
                              key={ai}
                              disabled={answered}
                              onClick={() => setAnswers((p) => ({ ...p, [qi]: ai }))}
                              style={{ background: bg, border, color, borderRadius: 6, padding: "10px 14px", fontSize: 13, textAlign: "left", cursor: answered ? "default" : "pointer", fontWeight: 500 }}
                            >
                              {alt}
                            </button>
                          );
                        })}
                      </div>
                      {answered && picked === correctIdx && (
                        <div style={{ fontSize: 12, marginTop: 8, fontWeight: 600, color: "#065f46" }}>✅ Rätt!</div>
                      )}
                      {answered && picked !== correctIdx && (
                        <div style={{ fontSize: 12, marginTop: 8, fontWeight: 600, color: "#991b1b" }}>
                          ❌ Fel! Rätt svar: {q.alternativ[correctIdx]}
                        </div>
                      )}
                    </div>
                  );
                })}
                {data.quiz.length > 0 && Object.keys(answers).length === data.quiz.length && (() => {
                  const total = data.quiz.length;
                  const score = data.quiz.reduce(
                    (acc, q, i) => acc + (answers[i] === Number(q.ratt_svar ?? q.ratt) ? 1 : 0),
                    0,
                  );
                  const passed = score >= Math.ceil(total * 0.6);
                  return (
                    <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid #f3f4f6", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                        Du fick {score} av {total} rätt
                      </div>
                      {passed ? (
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#065f46" }}>✅ Godkänd!</div>
                      ) : (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#991b1b" }}>❌ Försök igen</div>
                          <button
                            onClick={() => setAnswers({})}
                            style={{ background: "#0b1e2d", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "fit-content" }}
                          >
                            Gör om quiz
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </LightAppShell>
  );
}
