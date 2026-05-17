import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/modul/$id")({
  component: ModulDetailPage,
});

type Quiz = { fraga: string; alternativ: string[]; ratt: number };
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
      const { data: row } = await supabase.from("moduler").select("titel, steg, quiz").eq("id", id).maybeSingle();
      if (row) setData({ titel: row.titel, steg: (row.steg as Steg[]) ?? [], quiz: (row.quiz as Quiz[]) ?? [] });
      setLoading(false);
    })();
  }, [ready, id]);

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <main className="px-8 py-7 flex flex-col gap-6">
          <Link to="/moduler" className="inline-flex items-center gap-2 text-xs font-semibold w-fit" style={{ color: "#7dedb8" }}>
            <ArrowLeft size={14} strokeWidth={2} /> Tillbaka
          </Link>

          {loading && <div className="text-sm text-muted-foreground">Laddar modul...</div>}

          {!loading && !data && <div className="text-sm text-muted-foreground">Modulen kunde inte hittas.</div>}

          {data && (
            <>
              <h1 className="font-display font-bold text-white" style={{ fontSize: 24 }}>{data.titel}</h1>

              <div className="grid grid-cols-[3fr_2fr] gap-6">
                <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 10, padding: 24 }}>
                  <h2 className="font-display font-bold text-white text-[16px] mb-4">Steg</h2>
                  <div className="flex flex-col gap-4">
                    {data.steg.length === 0 && <div className="text-xs text-muted-foreground">Inga steg.</div>}
                    {data.steg.map((s, i) => {
                      const rubrik = typeof s === "string" ? "" : s.rubrik;
                      const text = typeof s === "string" ? s : s.text;
                      return (
                        <div key={i} className="flex gap-3">
                          <div className="shrink-0 flex items-center justify-center font-bold" style={{ width: 32, height: 32, borderRadius: 999, background: "#7dedb8", color: "#060f18", fontSize: 13 }}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            {rubrik && <div className="font-bold text-white text-[14px] mb-1">{rubrik}</div>}
                            <div className="text-[13px] text-foreground/90">{text}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 10, padding: 24 }}>
                  <h2 className="font-display font-bold text-white text-[16px] mb-4">Quiz</h2>
                  <div className="flex flex-col gap-5">
                    {data.quiz.length === 0 && <div className="text-xs text-muted-foreground">Inga frågor.</div>}
                    {data.quiz.map((q, qi) => {
                      const picked = answers[qi];
                      return (
                        <div key={qi}>
                          <div className="font-bold text-white text-[13px] mb-2">{qi + 1}. {q.fraga}</div>
                          <div className="flex flex-col gap-2">
                            {q.alternativ.map((alt, ai) => {
                              const answered = picked !== undefined;
                              const isCorrect = ai === q.ratt;
                              const isPicked = picked === ai;
                              let bg = "transparent";
                              let border = "1px solid #1a3d58";
                              let color = "white";
                              if (answered) {
                                if (isCorrect) { bg = "rgba(0,224,150,0.15)"; border = "1px solid rgba(0,224,150,0.5)"; color = "#00e096"; }
                                else if (isPicked) { bg = "rgba(255,77,106,0.15)"; border = "1px solid rgba(255,77,106,0.5)"; color = "#ff4d6a"; }
                              }
                              return (
                                <button
                                  key={ai}
                                  disabled={answered}
                                  onClick={() => setAnswers((p) => ({ ...p, [qi]: ai }))}
                                  style={{ background: bg, border, color, borderRadius: 6, padding: "10px 14px", fontSize: 13, textAlign: "left", cursor: answered ? "default" : "pointer" }}
                                >
                                  {alt}{answered && isCorrect ? " ✓" : ""}{answered && isPicked && !isCorrect ? " ✗" : ""}
                                </button>
                              );
                            })}
                          </div>
                          {picked !== undefined && picked !== q.ratt && (
                            <div className="text-[11px] mt-2" style={{ color: "#ffd166" }}>Rätt svar: {q.alternativ[q.ratt]}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <style>{sidebarKeyframes}</style>
    </div>
  );
}
