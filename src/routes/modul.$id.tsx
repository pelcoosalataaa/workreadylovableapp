import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/modul/$id")({
  component: ModulDetailPage,
});

type Quiz = { fraga: string; alternativ: string[]; ratt_svar?: number; ratt?: number };
type Steg = { rubrik?: string; text?: string } | string;

type Modul = {
  titel: string;
  kategori: string | null;
  steg: Steg[];
  quiz: Quiz[];
  transkription: string | null;
  skapad_av: string | null;
  created_at: string;
};

function stegText(s: Steg): string {
  if (typeof s === "string") return s;
  if (s.rubrik && s.text) return `${s.rubrik} — ${s.text}`;
  return s.text ?? s.rubrik ?? "";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("sv-SE");
  } catch {
    return iso;
  }
}

function ModulDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Modul | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [picked, setPicked] = useState<number | null>(null);

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
      setLoading(true);
      const { data: row } = await supabase
        .from("moduler")
        .select("titel, kategori, steg, quiz, transkription, skapad_av, created_at")
        .eq("id", id)
        .maybeSingle();
      if (row) {
        setData({
          titel: row.titel,
          kategori: row.kategori,
          steg: (row.steg as unknown as Steg[]) ?? [],
          quiz: (row.quiz as unknown as Quiz[]) ?? [],
          transkription: row.transkription,
          skapad_av: row.skapad_av,
          created_at: row.created_at,
        });
      } else {
        setData(null);
      }
      setLoading(false);
    })();
  }, [ready, id]);

  const totalQ = data?.quiz.length ?? 0;
  const finished = totalQ > 0 && Object.keys(answers).length === totalQ;
  const score = useMemo(() => {
    if (!data) return 0;
    return data.quiz.reduce(
      (acc, q, i) => acc + (answers[i] === Number(q.ratt_svar ?? q.ratt) ? 1 : 0),
      0,
    );
  }, [data, answers]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

  // Shell
  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex" }}>
      <AppSidebar />
      <div style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "14px 32px",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Link
            to="/utbildning"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              textDecoration: "none",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 14px",
              whiteSpace: "nowrap",
            }}
          >
            <ArrowLeft size={14} /> Tillbaka till utbildning
          </Link>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "#111827",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {data?.titel ?? (loading ? "Laddar modul..." : "Modul")}
            </h1>
            {data && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                {data.kategori ?? "Allmänt"} · {formatDate(data.created_at)} · Inspelad av: {data.skapad_av ?? "Okänd"}
              </div>
            )}
          </div>
        </header>

        <main style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
          {loading && (
            <div style={cardStyle()}>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Laddar modul...</div>
            </div>
          )}

          {!loading && !data && (
            <div style={{ ...cardStyle(), display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "#111827" }}>
                Modulen hittades inte
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Den här modulen finns inte längre eller har tagits bort.
              </div>
              <button
                onClick={() => navigate({ to: "/utbildning" })}
                style={primaryBtnStyle()}
              >
                ← Tillbaka till utbildning
              </button>
            </div>
          )}

          {data && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              {/* LEFT */}
              <div style={cardStyle()}>
                {!showQuiz ? (
                  <>
                    <h2 style={sectionTitle()}>Steg-för-steg</h2>
                    <div>
                      {data.steg.length === 0 && (
                        <div style={{ fontSize: 13, color: "#6b7280" }}>Inga steg.</div>
                      )}
                      {data.steg.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 12,
                            padding: "12px 0",
                            borderBottom: i === data.steg.length - 1 ? "none" : "1px solid #f9fafb",
                          }}
                        >
                          <div
                            style={{
                              flexShrink: 0,
                              width: 32,
                              height: 32,
                              borderRadius: 999,
                              background: "#0b1e2d",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "Syne, sans-serif",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {i + 1}
                          </div>
                          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, flex: 1, minWidth: 0 }}>
                            {stegText(s)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {data.quiz.length > 0 && (
                      <button
                        onClick={() => {
                          setShowQuiz(true);
                          setCurrentQ(0);
                          setAnswers({});
                          setPicked(null);
                        }}
                        style={{ ...primaryBtnStyle(), width: "100%", marginTop: 16 }}
                      >
                        Starta quiz →
                      </button>
                    )}
                  </>
                ) : (
                  <QuizView
                    quiz={data.quiz}
                    currentQ={currentQ}
                    setCurrentQ={setCurrentQ}
                    answers={answers}
                    setAnswers={setAnswers}
                    picked={picked}
                    setPicked={setPicked}
                    finished={finished}
                    score={score}
                    totalQ={totalQ}
                    onRetry={() => {
                      setAnswers({});
                      setPicked(null);
                      setCurrentQ(0);
                    }}
                    onBackToSteps={() => setShowQuiz(false)}
                  />
                )}
              </div>

              {/* RIGHT */}
              <div style={cardStyle()}>
                <h2 style={sectionTitle()}>Modulinformation</h2>
                <InfoRow label="Kategori" value={data.kategori ?? "Allmänt"} />
                <InfoRow label="Skapad" value={formatDate(data.created_at)} />
                <InfoRow label="Inspelad av" value={data.skapad_av ?? "Okänd"} />
                <InfoRow label="Antal steg" value={String(data.steg.length)} />
                <InfoRow label="Antal frågor" value={String(data.quiz.length)} last />

                <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0" }} />

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Transkription
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    lineHeight: 1.6,
                    maxHeight: 200,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {data.transkription || "Ingen transkription tillgänglig."}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function QuizView({
  quiz,
  currentQ,
  setCurrentQ,
  answers,
  setAnswers,
  picked,
  setPicked,
  finished,
  score,
  totalQ,
  onRetry,
  onBackToSteps,
}: {
  quiz: Quiz[];
  currentQ: number;
  setCurrentQ: (n: number) => void;
  answers: Record<number, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  picked: number | null;
  setPicked: (n: number | null) => void;
  finished: boolean;
  score: number;
  totalQ: number;
  onRetry: () => void;
  onBackToSteps: () => void;
}) {
  if (finished) {
    const pct = totalQ ? score / totalQ : 0;
    const passed = pct >= 0.8;
    return (
      <>
        <h2 style={sectionTitle()}>Quiz</h2>
        <div
          style={{
            background: passed ? "#d1fae5" : "#fee2e2",
            border: `1px solid ${passed ? "#10b981" : "#ef4444"}`,
            borderRadius: 10,
            padding: 20,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: passed ? "#065f46" : "#991b1b",
              lineHeight: 1.4,
            }}
          >
            {passed
              ? `✅ Godkänd! Du fick ${score} av 8 rätt — certifikat sparat.`
              : `❌ Försök igen. Du fick ${score} av 8 rätt. Du behöver minst 7 rätt för att bli godkänd.`}
          </div>
          {!passed && (
            <button onClick={onRetry} style={{ ...primaryBtnStyle(), marginTop: 16 }}>
              Gör om quiz
            </button>
          )}
          {passed && (
            <button onClick={onBackToSteps} style={{ ...primaryBtnStyle(), marginTop: 16 }}>
              ← Tillbaka till steg
            </button>
          )}
        </div>
      </>
    );
  }

  const q = quiz[currentQ];
  const correctIdx = Number(q.ratt_svar ?? q.ratt);
  const answered = picked !== null;
  const progress = ((currentQ + (answered ? 1 : 0)) / totalQ) * 100;

  return (
    <>
      <h2 style={sectionTitle()}>Quiz</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: "#6b7280" }}>Fråga {currentQ + 1} av {totalQ}</div>
      </div>
      <div style={{ background: "#f3f4f6", height: 6, borderRadius: 999, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "#0b1e2d", transition: "width 0.2s" }} />
      </div>

      <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 16 }}>
        {q.fraga}
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
              onClick={() => {
                setPicked(ai);
                setAnswers((p) => ({ ...p, [currentQ]: ai }));
              }}
              onMouseEnter={(e) => { if (!answered) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { if (!answered) e.currentTarget.style.background = "#fff"; }}
              style={{
                background: bg,
                border,
                color,
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: 13,
                textAlign: "left",
                cursor: answered ? "default" : "pointer",
                fontWeight: 500,
                transition: "background 0.15s",
              }}
            >
              {alt}
            </button>
          );
        })}
      </div>

      {answered && picked === correctIdx && (
        <div style={{ fontSize: 13, marginTop: 12, fontWeight: 600, color: "#065f46" }}>✅ Rätt!</div>
      )}
      {answered && picked !== correctIdx && (
        <div style={{ fontSize: 13, marginTop: 12, fontWeight: 600, color: "#991b1b" }}>
          ❌ Fel! Rätt svar: {q.alternativ[correctIdx]}
        </div>
      )}

      {answered && (
        <button
          onClick={() => {
            setPicked(null);
            setCurrentQ(currentQ + 1);
          }}
          style={{ ...primaryBtnStyle(), width: "100%", marginTop: 12 }}
        >
          {currentQ + 1 < totalQ ? "Nästa fråga →" : "Se resultat →"}
        </button>
      )}
    </>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: last ? "none" : "1px solid #f9fafb",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ color: "#111827", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function cardStyle(): React.CSSProperties {
  return {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 24,
  };
}

function sectionTitle(): React.CSSProperties {
  return {
    fontWeight: 700,
    fontSize: 14,
    color: "#111827",
    margin: 0,
    marginBottom: 16,
  };
}

function primaryBtnStyle(): React.CSSProperties {
  return {
    background: "#0b1e2d",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px 24px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
}
