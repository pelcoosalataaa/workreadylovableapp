import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell } from "@/components/LightAppShell";
import { Layers, ShieldAlert, FileText, Check, Loader2 } from "lucide-react";
import { processModuleVideo } from "@/lib/moduler.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/spela-in")({
  component: SpelaInPage,
});

const momentOptions = ["Välj moment...", "Gjutning", "Armering", "Traverskörning", "Säkerhet", "Ritningsläsning", "Annat"];
const categoryOptions = ["Betong & Prefab", "Verkstad & Industri", "Lager & Logistik", "Bygg & Anläggning"];

const previousModules = [
  { icon: <Layers size={18} strokeWidth={1.75} color="#0b1e2d" />, title: "Introduktion betong", author: "Erik Svensson", tag: "27/27", tone: "green" as const },
  { icon: <ShieldAlert size={18} strokeWidth={1.75} color="#0b1e2d" />, title: "Säkerhet & skydd", author: "Anna Berg", tag: "27/27", tone: "green" as const },
  { icon: <FileText size={18} strokeWidth={1.75} color="#0b1e2d" />, title: "Ritningsläsning", author: "Erik Svensson", tag: "19/27", tone: "amber" as const },
];

type StepState = "pending" | "active" | "done";
type Phase = "idle" | "uploading" | "transcribing" | "generating-steps" | "generating-quiz" | "done" | "error";

const MAX_SIZE = 500 * 1024 * 1024;

const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 24,
};

const SELECT: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  color: "#111827",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  width: "100%",
  outline: "none",
};

function StepBadge({ n }: { n: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1e2d",
        color: "#fff",
        width: 26,
        height: 26,
        borderRadius: 999,
        fontFamily: "Syne, sans-serif",
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {n}
    </div>
  );
}

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

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

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
      const serverPromise = processModuleVideo({ data: { videoPath, kategori, moment } });

      const moveToSteps = window.setTimeout(() => setPhase((p) => (p === "transcribing" ? "generating-steps" : p)), 8000);
      const moveToQuiz = window.setTimeout(() => setPhase((p) => (p === "generating-steps" ? "generating-quiz" : p)), 16000);

      try {
        await serverPromise;
        window.clearTimeout(moveToSteps);
        window.clearTimeout(moveToQuiz);
        setPhase("done");
        setSuccessMsg("Modulen är klar och har skickats till all personal!");

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

  const tagBadge = (tone: "green" | "amber") => ({
    background: tone === "green" ? "#d1fae5" : "#fef3c7",
    color: tone === "green" ? "#065f46" : "#92400e",
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 999,
  });

  const submitBtn = (
    <button
      type="button"
      onClick={() => !processing && triggerFilePick()}
      disabled={processing || moment === momentOptions[0]}
      style={{
        background: "#0b1e2d",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 18px",
        fontSize: 13,
        fontWeight: 600,
        cursor: processing || moment === momentOptions[0] ? "not-allowed" : "pointer",
        opacity: processing || moment === momentOptions[0] ? 0.6 : 1,
      }}
    >
      Låt AI bygga modulen
    </button>
  );

  return (
    <LightAppShell title="Spela in ny modul" action={submitBtn}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "3fr 2fr" }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Step 1 */}
          <section style={CARD}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <StepBadge n={1} />
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#111827", margin: 0 }}>
                Välj moment att spela in
              </h2>
            </div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5, textTransform: "uppercase" }}>Moment</label>
            <select value={moment} onChange={(e) => setMoment(e.target.value)} style={{ ...SELECT, marginTop: 6, marginBottom: 14 }}>
              {momentOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5, textTransform: "uppercase" }}>Branschkategori</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={{ ...SELECT, marginTop: 6 }}>
              {categoryOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </section>

          {/* Step 2 */}
          <section style={CARD}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <StepBadge n={2} />
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#111827", margin: 0 }}>
                Ladda upp din video
              </h2>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/*"
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div
              onMouseEnter={() => setUploadHover(true)}
              onMouseLeave={() => setUploadHover(false)}
              onClick={() => !processing && triggerFilePick()}
              onDragOver={(e) => { e.preventDefault(); setUploadHover(true); }}
              onDragLeave={() => setUploadHover(false)}
              onDrop={(e) => { e.preventDefault(); setUploadHover(false); if (!processing) handleFiles(e.dataTransfer.files); }}
              style={{
                border: `2px dashed ${uploadHover ? "#0b1e2d" : "#e5e7eb"}`,
                borderRadius: 10,
                padding: 40,
                background: "#fff",
                textAlign: "center",
                cursor: processing ? "not-allowed" : "pointer",
                opacity: processing ? 0.6 : 1,
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ fontSize: 40 }}>📹</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginTop: 8 }}>Dra & släpp video här</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                Eller klicka för att välja · MP4, MOV · max 500MB
              </div>
            </div>

            {phase === "uploading" && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                  <span>Laddar upp video...</span>
                  <span>{Math.round(uploadPct)}%</span>
                </div>
                <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${uploadPct}%`, height: "100%", background: "#0b1e2d", transition: "width 0.2s" }} />
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{ marginTop: 14, borderRadius: 8, padding: "10px 12px", background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 12 }}>
                {errorMsg}
              </div>
            )}

            <div style={{ marginTop: 14, borderRadius: 8, padding: 12, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", fontSize: 12 }}>
              💡 Tips: Filma det viktigaste momentet. 5–10 minuter räcker. Prata naturligt — AI fixar resten.
            </div>
          </section>

          {/* Step 3 */}
          <section style={{ ...CARD, opacity: phase === "idle" ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <StepBadge n={3} />
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#111827", margin: 0 }}>
                AI bygger utbildningen
              </h2>
            </div>

            {phase === "idle" ? (
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                Ladda upp din video i steg 2 för att aktivera AI-bearbetningen.
              </p>
            ) : (
              <ol style={{ display: "flex", flexDirection: "column", gap: 10, margin: 0, padding: 0, listStyle: "none" }}>
                {stepStates.map((s, i) => {
                  const bg = s.state === "done" ? "#d1fae5" : s.state === "active" ? "#0b1e2d" : "#f3f4f6";
                  const color = s.state === "done" ? "#065f46" : s.state === "active" ? "#fff" : "#9ca3af";
                  return (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: bg, color, fontSize: 11, fontWeight: 700 }}>
                        {s.state === "done" && <Check size={14} strokeWidth={3} />}
                        {s.state === "active" && <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />}
                        {s.state === "pending" && (i + 1)}
                      </div>
                      <span style={{ fontSize: 13, color: s.state === "pending" ? "#9ca3af" : "#111827", fontWeight: s.state === "active" ? 600 : 500 }}>{s.label}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            {successMsg && (
              <div style={{ marginTop: 16, borderRadius: 8, padding: "12px 14px", background: "#d1fae5", border: "1px solid #10b981", color: "#065f46", fontSize: 13, fontWeight: 600 }}>
                ✓ {successMsg}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section style={CARD}>
            <h2 style={{ fontWeight: 700, fontSize: 14, color: "#111827", margin: 0, marginBottom: 16 }}>Hur det fungerar</h2>
            <ol style={{ display: "flex", flexDirection: "column", gap: 12, margin: 0, padding: 0, listStyle: "none" }}>
              {[
                { title: "Du väljer moment", desc: "Vilket arbetsmoment ska läras ut?" },
                { title: "Du laddar upp video", desc: "5–10 minuter räcker. AI hanterar resten." },
                { title: "AI transkriberar", desc: "Omvandlar tal till text automatiskt" },
                { title: "AI skapar steg & quiz", desc: "Strukturerar och bygger utbildningen" },
                { title: "Personal får SMS", desc: "Länk skickas direkt till ny personal" },
              ].map((s, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: "#0b1e2d", color: "#fff", fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div style={{ height: 1, background: "#f3f4f6", margin: "18px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { v: "5 min", l: "Inspelningstid" },
                { v: "30 sek", l: "AI-bearbetning" },
                { v: "Dag 0", l: "Personal redo" },
              ].map((s) => (
                <div
                  key={s.l}
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "12px 8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#0b1e2d" }}>{s.v}</div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, color: "#6b7280", marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={CARD}>
            <h2 style={{ fontWeight: 700, fontSize: 14, color: "#111827", margin: 0, marginBottom: 12 }}>Tidigare moduler</h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {previousModules.map((m, i) => (
                <div
                  key={m.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i === previousModules.length - 1 ? "none" : "1px solid #f3f4f6",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                    {m.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{m.author}</div>
                  </div>
                  <span style={tagBadge(m.tone)}>{m.tag}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </LightAppShell>
  );
}
