import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/kurs/$id")({ component: KursVisning });

type QuizFraga = { fraga: string; alternativ: string[]; ratt_svar: number };
type Kurs = { id: string; titel: string; steg: string[]; quiz: QuizFraga[] };

type Fas = "steg" | "quiz" | "resultat";

function KursVisning() {
  const { id } = Route.useParams();
  const { loading, user } = useAuth();
  const navigate = useNavigate();
  const [kurs, setKurs] = useState<Kurs | null>(null);
  const [fas, setFas] = useState<Fas>("steg");
  const [stegIdx, setStegIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [valt, setValt] = useState<number | null>(null);
  const [poang, setPoang] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) return void navigate({ to: "/login" });
    (async () => {
      const { data, error } = await supabase.from("kurser").select("*").eq("id", id).maybeSingle();
      if (error || !data) return toast.error("Kunde inte ladda kurs");
      setKurs({
        id: data.id,
        titel: data.titel,
        steg: data.steg as unknown as string[],
        quiz: data.quiz as unknown as QuizFraga[],
      });
    })();
  }, [id, loading, user, navigate]);

  if (!kurs) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Laddar…</div>;

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <h1 className="text-3xl font-bold text-primary">{kurs.titel}</h1>

        {fas === "steg" && (
          <div className="card-shadow space-y-6 rounded-2xl bg-card p-8">
            <div className="text-sm text-muted-foreground">Steg {stegIdx + 1} av {kurs.steg.length}</div>
            <p className="text-lg leading-relaxed">{kurs.steg[stegIdx]}</p>
            <div className="flex justify-end">
              {stegIdx < kurs.steg.length - 1 ? (
                <Button onClick={() => setStegIdx(stegIdx + 1)}>Nästa</Button>
              ) : (
                <Button onClick={() => setFas("quiz")}>Starta quiz</Button>
              )}
            </div>
          </div>
        )}

        {fas === "quiz" && (() => {
          const q = kurs.quiz[quizIdx];
          const visarFacit = valt !== null;
          return (
            <div className="card-shadow space-y-4 rounded-2xl bg-card p-8">
              <div className="text-sm text-muted-foreground">Fråga {quizIdx + 1} av {kurs.quiz.length}</div>
              <h2 className="text-xl font-semibold">{q.fraga}</h2>
              <div className="space-y-2">
                {q.alternativ.map((a, i) => {
                  const isRatt = i === q.ratt_svar;
                  const isValt = i === valt;
                  const klass = !visarFacit
                    ? "border-border hover:bg-accent"
                    : isRatt
                    ? "border-primary bg-primary/10"
                    : isValt
                    ? "border-destructive bg-destructive/10"
                    : "border-border opacity-60";
                  return (
                    <button
                      key={i}
                      disabled={visarFacit}
                      onClick={() => {
                        setValt(i);
                        if (i === q.ratt_svar) setPoang((p) => p + 1);
                      }}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${klass}`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              {visarFacit && (
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      if (quizIdx < kurs.quiz.length - 1) {
                        setValt(null);
                        setQuizIdx(quizIdx + 1);
                      } else {
                        const godkand = poang >= 6;
                        if (user && godkand) {
                          const { data: redan } = await supabase
                            .from("resultat")
                            .select("id")
                            .eq("kurs_id", kurs.id)
                            .eq("anvandare_id", user.id)
                            .eq("godkand", true)
                            .maybeSingle();
                          if (!redan) {
                            await supabase.from("resultat").insert({
                              kurs_id: kurs.id,
                              anvandare_id: user.id,
                              godkand,
                              poang,
                            });
                          }
                        }
                        setFas("resultat");
                      }
                    }}
                  >
                    {quizIdx < kurs.quiz.length - 1 ? "Nästa fråga" : "Se resultat"}
                  </Button>
                </div>
              )}
            </div>
          );
        })()}

        {fas === "resultat" && (
          <div className="card-shadow space-y-4 rounded-2xl bg-card p-8 text-center">
            {poang >= 6 ? (
              <>
                <div className="text-3xl font-bold text-primary">🎉 Godkänd!</div>
                <p className="text-muted-foreground">Du fick {poang} av {kurs.quiz.length} rätt.</p>
                <Button asChild><Link to="/kurser">Tillbaka till kurser</Link></Button>
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">Försök igen</div>
                <p className="text-muted-foreground">Du fick {poang} av {kurs.quiz.length} rätt. Du behöver minst 6.</p>
                <Button
                  onClick={() => {
                    setPoang(0);
                    setQuizIdx(0);
                    setStegIdx(0);
                    setFas("steg");
                  }}
                >
                  Börja om
                </Button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
