import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { hamtaKursForVisning, lamnaInQuiz } from "@/lib/kurs.functions";
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
  const hamta = useServerFn(hamtaKursForVisning);
  const lamnaIn = useServerFn(lamnaInQuiz);
  const [kurs, setKurs] = useState<Kurs | null>(null);
  const [fas, setFas] = useState<Fas>("steg");
  const [stegIdx, setStegIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [svar, setSvar] = useState<number[]>([]);
  const [valt, setValt] = useState<number | null>(null);
  const [visarFacit, setVisarFacit] = useState(false);
  const [resultat, setResultat] = useState<{ poang: number; antal: number; godkand: boolean } | null>(null);
  const [skickar, setSkickar] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return void navigate({ to: "/login" });
    (async () => {
      try {
        const data = await hamta({ data: { kurs_id: id } });
        setKurs(data);
      } catch {
        toast.error("Kunde inte ladda kurs");
      }
    })();
  }, [id, loading, user, navigate, hamta]);

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
          const sista = quizIdx === kurs.quiz.length - 1;
          return (
            <div className="card-shadow space-y-4 rounded-2xl bg-card p-8">
              <div className="text-sm text-muted-foreground">Fråga {quizIdx + 1} av {kurs.quiz.length}</div>
              <h2 className="text-xl font-semibold">{q.fraga}</h2>
              <div className="space-y-2">
                {q.alternativ.map((a, i) => {
                  const isValt = i === valt;
                  const isRatt = i === q.ratt_svar;
                  let klass = "border-border hover:bg-accent";
                  if (visarFacit) {
                    if (isRatt) klass = "border-green-600 bg-green-600/10 text-green-700 dark:text-green-400";
                    else if (isValt) klass = "border-red-600 bg-red-600/10 text-red-700 dark:text-red-400";
                    else klass = "border-border opacity-60";
                  } else if (isValt) {
                    klass = "border-primary bg-primary/10";
                  }
                  return (
                    <button
                      key={i}
                      disabled={visarFacit}
                      onClick={() => !visarFacit && setValt(i)}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${klass}`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end">
                {!visarFacit ? (
                  <Button disabled={valt === null} onClick={() => setVisarFacit(true)}>
                    Kontrollera svar
                  </Button>
                ) : (
                  <Button
                    disabled={skickar}
                    onClick={async () => {
                      const nyaSvar = [...svar, valt!];
                      if (!sista) {
                        setSvar(nyaSvar);
                        setValt(null);
                        setVisarFacit(false);
                        setQuizIdx(quizIdx + 1);
                      } else {
                        setSkickar(true);
                        try {
                          const res = await lamnaIn({ data: { kurs_id: kurs.id, svar: nyaSvar } });
                          setResultat(res);
                          setFas("resultat");
                        } catch {
                          toast.error("Kunde inte spara resultat");
                        } finally {
                          setSkickar(false);
                        }
                      }
                    }}
                  >
                    {sista ? "Lämna in" : "Nästa fråga"}
                  </Button>
                )}
              </div>
            </div>
          );
        })()}

        {fas === "resultat" && resultat && (
          <div className="card-shadow space-y-4 rounded-2xl bg-card p-8 text-center">
            {resultat.godkand ? (
              <>
                <div className="text-3xl font-bold text-primary">🎉 Godkänd!</div>
                <p className="text-muted-foreground">Du fick {resultat.poang} av {resultat.antal} rätt.</p>
                <Button asChild><Link to="/kurser">Tillbaka till kurser</Link></Button>
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">Försök igen</div>
                <p className="text-muted-foreground">Du fick {resultat.poang} av {resultat.antal} rätt. Du behöver minst 6.</p>
                <Button
                  onClick={() => {
                    setSvar([]);
                    setValt(null);
                    setVisarFacit(false);
                    setQuizIdx(0);
                    setStegIdx(0);
                    setResultat(null);
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
