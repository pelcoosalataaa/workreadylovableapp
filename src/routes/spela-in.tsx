import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { CircleDot, Layers, ShieldAlert, FileText, Check, Loader2 } from "lucide-react";
import { processModuleVideo } from "@/lib/moduler.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/spela-in")({
  component: SpelaInPage,
});

const momentOptions = ["Välj moment...", "Gjutning", "Armering", "Traverskörning", "Säkerhet", "Ritningsläsning", "Annat"];
const categoryOptions = ["Betong & Prefab", "Verkstad & Industri", "Lager & Logistik", "Bygg & Anläggning"];

const previousModules = [
  { icon: <Layers size={20} strokeWidth={1.75} color="#7dedb8" />, title: "Introduktion betong", author: "Erik Svensson", tag: "27/27", color: "#00e096" },
  { icon: <ShieldAlert size={20} strokeWidth={1.75} color="#ffd166" />, title: "Säkerhet & skydd", author: "Anna Berg", tag: "27/27", color: "#00e096" },
  { icon: <FileText size={20} strokeWidth={1.75} color="#60b0f4" />, title: "Ritningsläsning", author: "Erik Svensson", tag: "19/27", color: "#ffd166" },
];

type StepState = "pending" | "active" | "done";
type Phase = "idle" | "uploading" | "transcribing" | "generating-steps" | "generating-quiz" | "done" | "error";

const MAX_SIZE = 500 * 1024 * 1024;

function SpelaInPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [uploadHover, setUploadHover] = useState(false);
  const [moment, setMoment] = useState(momentOptions[0]);
  const [kategori, setKategori] = useState(categoryOptions[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const selectStyle = { background: "#060f18", border: "1px solid #1a3d58", color: "#edfaf4" } as const;

  const stepStates: { label: string; state: StepState }[] = [
    { label: "Video uppladdad", state: phase === "idle" || phase === "uploading" ? (phase === "uploading" ? "active" : "pending") : "done" },
    { label: "AI transkriberar talet...", state: phase === "transcribing" ? "active" : (["generating-steps", "generating-quiz", "done"].includes(phase) ? "done" : "pending") },
    { label: "AI skapar steg & instruktioner...", state: phase === "generating-steps" ? "active" : (["generating-quiz", "done"].includes(phase) ? "done" : "pending") },
    { label: "AI genererar quiz-frågor...", state: phase === "generating-quiz" ? "active" : (phase === "done" ? "done" : "pending") },
    { label: "Modul klar!", state: phase === "done" ? "done" : "pending" },
  ];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMsg(null);
    setSuccessMsg(null);

    if (moment === momentOptions[0]) {
      setErrorMsg("Välj ett moment först");
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrorMsg("Filen är för stor (max 500MB)");
      return;
    }

    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;
    if (!userId) {
      setErrorMsg("Inte inloggad");
      return;
    }

    const videoPath = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    try {
      setPhase("uploading");
      setUploadPct(0);
      // Simulated progress while uploading (supabase-js doesn't expose progress events natively)
      const tick = window.setInterval(() => {
        setUploadPct((p) => (p < 90 ? p + Math.random() * 8 : p));
      }, 250);

      const { error: upErr } = await supabase.storage.from("moduler").upload(videoPath, file, {
        contentType: file.type || "video/mp4",
        upsert: false,
      });
      window.clearInterval(tick);
      if (upErr) {
        setPhase("error");
        setErrorMsg("Uppladdningen misslyckades — försök igen");
        return;
      }
      setUploadPct(100);

      setPhase("transcribing");
      // GPT phase is one server call; split UI into two stages for perceived progress
      const serverPromise = processModuleVideo({ data: { videoPath, kategori, moment } });

      // After ~when whisper typically finishes, optimistically move UI forward
      const moveToSteps = window.setTimeout(() => setPhase((p) => (p === "transcribing" ? "generating-steps" : p)), 8000);
      const moveToQuiz = window.setTimeout(() => setPhase((p) => (p === "generating-steps" ? "generating-quiz" : p)), 16000);

      try {
        await serverPromise;
        window.clearTimeout(moveToSteps);
        window.clearTimeout(moveToQuiz);
        setPhase("done");
        setSuccessMsg("Modulen är klar och har skickats till all personal!");

        // Send SMS notification to test number
        try {
          const { data: smsData, error: smsErr } = await supabase.functions.invoke("send-sms", {
            body: {
              to: "+46735255494",
              message: "Hej! Du har fått en ny utbildningsmodul i WorkReady. Logga in för att börja din utbildning.",
            },
          });
          if (smsErr || !smsData?.success) {
            toast("❌ SMS kunde inte skickas");
          } else {
            toast("✅ SMS skickat till personal!");
          }
        } catch {
          toast("❌ SMS kunde inte skickas");
        }
      } catch (err) {
        window.clearTimeout(moveToSteps);
        window.clearTimeout(moveToQuiz);
        const msg = err instanceof Error ? err.message : "";
        setPhase("error");
        if (msg.includes("transcription_failed")) {
          setErrorMsg("AI kunde inte transkribera videon — kontrollera att videon har ljud");
        } else if (msg.includes("generation_failed") || msg.includes("save_failed")) {
          setErrorMsg("AI kunde inte skapa modulen — försök igen");
        } else {
          setErrorMsg("AI kunde inte skapa modulen — försök igen");
        }
      }
    } catch {
      setPhase("error");
      setErrorMsg("Uppladdningen misslyckades — försök igen");
    }
  };

  const triggerFilePick = () => fileInputRef.current?.click();
  const processing = phase !== "idle" && phase !== "done" && phase !== "error";

  return (
    <>
      <style>{sidebarKeyframes}</style>
      <AppSidebar />
      <main className="ml-[260px] min-h-screen p-8" style={{ background: "#060f18" }}>
        <header className="mb-6">
          <h1 className="font-display font-bold text-[24px] text-foreground flex items-center gap-2"><CircleDot size={22} strokeWidth={1.75} color="#7dedb8" /> Spela in ny modul</h1>
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
              <select value={moment} onChange={(e) => setMoment(e.target.value)} className="w-full rounded-md mt-1 mb-4 px-3 py-3 text-sm outline-none" style={selectStyle}>
                {momentOptions.map((o) => <option key={o} style={{ background: "#060f18" }}>{o}</option>)}
              </select>
              <label className="text-[11px] uppercase tracking-wider" style={{ color: "#3d6a7a" }}>Branschkategori</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full rounded-md mt-1 px-3 py-3 text-sm outline-none" style={selectStyle}>
                {categoryOptions.map((o) => <option key={o} style={{ background: "#060f18" }}>{o}</option>)}
              </select>
            </section>

            {/* Step 2 */}
            <section className={cardCls} style={cardStyle}>
              <div className="font-mono text-[9px] tracking-wider" style={{ color: "#7dedb8", fontFamily: "'Space Mono', monospace" }}>STEG 2</div>
              <h2 className="font-display font-bold text-[18px] mt-1 mb-4">Ladda upp din video</h2>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div
                onMouseEnter={() => setUploadHover(true)}
                onMouseLeave={() => setUploadHover(false)}
                onClick={() => !processing && triggerFilePick()}
                onDragOver={(e) => { e.preventDefault(); setUploadHover(true); }}
                onDragLeave={() => setUploadHover(false)}
                onDrop={(e) => { e.preventDefault(); setUploadHover(false); if (!processing) handleFiles(e.dataTransfer.files); }}
                className="rounded-lg text-center transition-all"
                style={{
                  border: `2px dashed ${uploadHover ? "#7dedb8" : "#1a3d58"}`,
                  padding: "40px",
                  background: uploadHover ? "rgba(125,237,184,0.05)" : "rgba(125,237,184,0.02)",
                  cursor: processing ? "not-allowed" : "pointer",
                  opacity: processing ? 0.6 : 1,
                }}
              >
                <div style={{ fontSize: 40 }}>📹</div>
                <div className="text-[16px] font-bold text-foreground mt-2">Dra & släpp video här</div>
                <div className="text-[13px] mt-1" style={{ color: "#3d6a7a" }}>
                  Eller klicka för att välja · MP4, MOV · max 500MB
                </div>
              </div>

              {phase === "uploading" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[12px] mb-2" style={{ color: "#3d6a7a" }}>
                    <span>Laddar upp video...</span>
                    <span>{Math.round(uploadPct)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#1a3d58" }}>
                    <div className="h-full transition-all" style={{ width: `${uploadPct}%`, background: "#7dedb8" }} />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mt-4 rounded-md text-[12px] px-3 py-2" style={{ background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.3)", color: "#ff4d6a" }}>
                  {errorMsg}
                </div>
              )}

              <div className="mt-4 rounded-md text-[12px]" style={{ background: "rgba(125,237,184,0.05)", border: "1px solid rgba(125,237,184,0.15)", padding: "12px", color: "#3d6a7a" }}>
                💡 Tips: Filma det viktigaste momentet. 5–10 minuter räcker. Prata naturligt — AI fixar resten.
              </div>
            </section>

            {/* Step 3 — progress / status */}
            <section className={cardCls} style={{ ...cardStyle, opacity: phase === "idle" ? 0.5 : 1 }}>
              <div className="font-mono text-[9px] tracking-wider" style={{ color: phase === "idle" ? "#3d6a7a" : "#7dedb8", fontFamily: "'Space Mono', monospace" }}>STEG 3</div>
              <h2 className="font-display font-bold text-[18px] mt-1 mb-4">AI bygger utbildningen</h2>

              {phase === "idle" ? (
                <p className="text-[13px]" style={{ color: "#3d6a7a" }}>
                  Ladda upp din video i steg 2 för att aktivera AI-bearbetningen.
                </p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {stepStates.map((s, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex items-center justify-center shrink-0" style={{ width: 22, height: 22, borderRadius: 999, background: s.state === "done" ? "#00e096" : s.state === "active" ? "transparent" : "transparent", border: s.state === "pending" ? "1px solid #3d6a7a" : s.state === "active" ? "1px solid #7dedb8" : "none" }}>
                        {s.state === "done" && <Check size={14} strokeWidth={3} color="#060f18" />}
                        {s.state === "active" && <Loader2 size={14} strokeWidth={2.5} color="#7dedb8" className="animate-spin" />}
                      </div>
                      <span className="text-[13px]" style={{ color: s.state === "pending" ? "#3d6a7a" : "#edfaf4", fontWeight: s.state === "active" ? 600 : 400 }}>{s.label}</span>
                    </li>
                  ))}
                </ol>
              )}

              {successMsg && (
                <div className="mt-5 rounded-md text-[13px] px-4 py-3 font-semibold" style={{ background: "rgba(125,237,184,0.1)", border: "1px solid rgba(125,237,184,0.3)", color: "#7dedb8" }}>
                  ✓ {successMsg}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5">
            <section className={cardCls} style={cardStyle}>
              <h2 className="font-display font-bold text-[16px] mb-4">Hur det fungerar</h2>
              <ol className="flex flex-col gap-3">
                {[
                  { mark: "✓", title: "Du väljer moment", desc: "Vilket arbetsmoment ska läras ut?" },
                  { mark: "✓", title: "Du laddar upp video", desc: "5–10 minuter räcker. AI hanterar resten." },
                  { mark: "", title: "AI transkriberar", desc: "Omvandlar tal till text automatiskt" },
                  { mark: "○", title: "AI skapar steg & quiz", desc: "Strukturerar och bygger utbildningen" },
                  { mark: "○", title: "Personal får SMS", desc: "Länk skickas direkt till ny personal" },
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex items-center justify-center text-[10px] font-bold shrink-0" style={{ width: 20, height: 20, borderRadius: 999, background: s.mark === "✓" ? "#00e096" : s.mark === "" ? "#7dedb8" : "transparent", border: s.mark === "○" ? "1px solid #3d6a7a" : "none", color: "#060f18" }}>
                      {s.mark}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{s.title}</div>
                      <div className="text-[12px]" style={{ color: "#3d6a7a" }}>{s.desc}</div>
                    </div>
                  </li>
                ))}
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
                    <div className="flex h-5 w-5 items-center justify-center">{m.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-foreground truncate">{m.title}</div>
                      <div className="text-[11px]" style={{ color: "#3d6a7a" }}>{m.author}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: `${m.color}1a`, color: m.color, border: `1px solid ${m.color}33` }}>
                      {m.tag}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
