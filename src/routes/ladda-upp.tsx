import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { skapaKursMedAi, skapaKursMedDokument } from "@/lib/kurs.functions";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Loader2, Video, FileText } from "lucide-react";

export const Route = createFileRoute("/ladda-upp")({ component: LaddaUpp });

const videoStegLabels = ["Laddar upp...", "AI lyssnar...", "AI skriver kurs...", "Klar!"];
const dokStegLabels = ["Laddar upp...", "AI läser dokument...", "AI skriver kurs...", "Klar!"];

type Typ = "video" | "dokument";

function LaddaUpp() {
  const { user, profil } = useAuth();
  const navigate = useNavigate();
  const skapaVideo = useServerFn(skapaKursMedAi);
  const skapaDok = useServerFn(skapaKursMedDokument);
  const [typ, setTyp] = useState<Typ>("video");
  const [namn, setNamn] = useState("");
  const [fil, setFil] = useState<File | null>(null);
  const [steg, setSteg] = useState<number>(-1);
  const [klar, setKlar] = useState(false);

  const stegLabels = typ === "video" ? videoStegLabels : dokStegLabels;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !fil) return;
    if (profil?.roll !== "chef") return toast.error("Endast chefer kan skapa kurser.");

    try {
      setSteg(0);
      const path = `${user.id}/${Date.now()}-${fil.name}`;
      const { error: upErr } = await supabase.storage.from("kurser").upload(path, fil);
      if (upErr) throw upErr;

      setSteg(1);
      const promise = typ === "video"
        ? skapaVideo({ data: { kursnamn: namn, storage_path: path } })
        : skapaDok({ data: { kursnamn: namn, storage_path: path, mime: fil.type || "application/octet-stream" } });
      setTimeout(() => setSteg((s) => (s < 2 ? 2 : s)), 4000);
      await promise;
      setSteg(3);
      setKlar(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Något gick fel";
      toast.error(msg);
      setSteg(-1);
    }
  };

  void navigate;

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <h1 className="text-3xl font-bold text-primary">Skapa kurs</h1>

        {!klar && steg === -1 && (
          <form onSubmit={onSubmit} className="card-shadow space-y-5 rounded-2xl bg-card p-6">
            <div>
              <Label className="mb-2 block">Källa</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setTyp("video"); setFil(null); }}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${typ === "video" ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
                >
                  <Video className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Video</div>
                    <div className="text-xs text-muted-foreground">MP4, MP3 m.m.</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setTyp("dokument"); setFil(null); }}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${typ === "dokument" ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
                >
                  <FileText className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Dokument</div>
                    <div className="text-xs text-muted-foreground">PDF, TXT, MD</div>
                  </div>
                </button>
              </div>
            </div>
            <div>
              <Label>Kursnamn</Label>
              <Input required value={namn} onChange={(e) => setNamn(e.target.value)} placeholder={typ === "dokument" ? "T.ex. GDPR-grunder" : "T.ex. Säkerhet på lagret"} />
            </div>
            <div>
              <Label>{typ === "video" ? "Videofil" : "Dokumentfil"}</Label>
              <Input
                type="file"
                accept={typ === "video" ? "video/*,audio/*" : ".pdf,.txt,.md,application/pdf,text/plain,text/markdown"}
                required
                onChange={(e) => setFil(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg">Skapa kurs med AI</Button>
          </form>
        )}

        {steg >= 0 && !klar && (
          <div className="card-shadow space-y-3 rounded-2xl bg-card p-6">
            {stegLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < steg ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : i === steg ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-border" />
                )}
                <span className={i <= steg ? "text-foreground" : "text-muted-foreground"}>
                  {i + 1}. {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {klar && (
          <div className="card-shadow rounded-2xl bg-card p-8 text-center">
            <div className="text-2xl font-semibold text-primary">✅ Kursen är klar!</div>
            <Button asChild className="mt-6">
              <Link to="/dashboard">Tillbaka till dashboard</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
