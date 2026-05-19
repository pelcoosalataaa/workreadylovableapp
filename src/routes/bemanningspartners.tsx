import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell } from "@/components/LightAppShell";
import { PrimaryBtn, SecondaryBtn } from "@/components/AppTopBar";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/bemanningspartners")({
  component: BemanningspartnersPage,
});

type Tone = "green" | "amber" | "red" | "blue";

const AVATAR: Record<Tone, { bg: string; color: string }> = {
  green: { bg: "#d1fae5", color: "#065f46" },
  amber: { bg: "#fef3c7", color: "#92400e" },
  red: { bg: "#fee2e2", color: "#991b1b" },
  blue: { bg: "#dbeafe", color: "#1e40af" },
};

type Worker = {
  initials: string; avatar: Tone; name: string; role: string;
  dept: string; start: string; progress: number;
  status: "Klar" | "Pågår" | "Ej påbörjat";
};

type Partner = {
  id: string; logo: string; logoBg: string; logoColor: string;
  name: string; city: string; type: string; email: string; phone: string;
  uthyrda: number; klara: number; pagar: number;
  workers: Worker[];
};

const PARTNERS: Partner[] = [
  {
    id: "p2w", logo: "P2", logoBg: "#0b1e2d", logoColor: "#7dedb8",
    name: "Partner2Work AB", city: "Vänersborg", type: "Bemanning & Rekrytering",
    email: "info@partner2work.se", phone: "010-889 98 30",
    uthyrda: 8, klara: 6, pagar: 2,
    workers: [
      { initials: "PL", avatar: "amber", name: "Petter Lindgren", role: "Truckförare", dept: "Lager & Utskeppning", start: "2024-11-01", progress: 65, status: "Pågår" },
      { initials: "SB", avatar: "red", name: "Sara Berg", role: "Betongarbetare", dept: "Gjutavdelningen", start: "2024-11-12", progress: 0, status: "Ej påbörjat" },
      { initials: "LN", avatar: "green", name: "Lisa Nordin", role: "Armerare", dept: "Armeringsavdelningen", start: "2024-10-15", progress: 100, status: "Klar" },
      { initials: "TK", avatar: "green", name: "Tommy Karlsson", role: "Truckförare", dept: "Lager", start: "2024-09-01", progress: 100, status: "Klar" },
      { initials: "BM", avatar: "amber", name: "Bo Magnusson", role: "Lagermedarbetare", dept: "Lager", start: "2024-11-10", progress: 25, status: "Pågår" },
    ],
  },
  {
    id: "ikett", logo: "IK", logoBg: "#1e40af", logoColor: "#ffffff",
    name: "Ikett Personalpartner", city: "Göteborg", type: "Bemanning",
    email: "info@ikett.se", phone: "031-123 45 67",
    uthyrda: 3, klara: 1, pagar: 2,
    workers: [
      { initials: "JN", avatar: "blue", name: "Johan Nilsson", role: "Montör", dept: "Montering", start: "2024-11-08", progress: 40, status: "Pågår" },
      { initials: "KA", avatar: "green", name: "Karin Andersson", role: "Operatör", dept: "CNC-produktion", start: "2024-10-20", progress: 100, status: "Klar" },
      { initials: "BM", avatar: "amber", name: "Bo Magnusson", role: "Lagermedarbetare", dept: "Lager", start: "2024-11-10", progress: 25, status: "Pågår" },
    ],
  },
];

const STATS = [
  { label: "AKTIVA PARTNERS", value: "2", sub: "bemanningsbolag", color: "#3b82f6" },
  { label: "TOTALT UTHYRD", value: "11", sub: "aktiva medarbetare", color: "#10b981" },
  { label: "UNDER UPPLÄRNING", value: "4", sub: "ej klara", color: "#f59e0b" },
];

function StatusBadge({ s }: { s: Worker["status"] }) {
  const m: Record<Worker["status"], { bg: string; color: string }> = {
    Klar: { bg: "#d1fae5", color: "#065f46" },
    Pågår: { bg: "#fef3c7", color: "#92400e" },
    "Ej påbörjat": { bg: "#fee2e2", color: "#991b1b" },
  };
  return <span style={{ background: m[s].bg, color: m[s].color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>{s}</span>;
}

function BemanningspartnersPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [managePartner, setManagePartner] = useState<Partner | null>(null);
  const [tab, setTab] = useState<"Personal" | "Kontakt" | "Avtal">("Personal");

  const [pName, setPName] = useState("");
  const [pCity, setPCity] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPhone, setPPhone] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (!s) navigate({ to: "/login" }); });
    supabase.auth.getSession().then(({ data }) => { if (!data.session) navigate({ to: "/login" }); else setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

  return (
    <LightAppShell
      title="Bemanningspartners"
      action={<PrimaryBtn onClick={() => setAddOpen(true)}>+ Lägg till partner</PrimaryBtn>}
    >
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "20px 22px", borderLeft: `4px solid ${s.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 40, color: "#111827", lineHeight: 1.1, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Partner cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PARTNERS.map((p) => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: p.logoBg, color: p.logoColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 18 }}>{p.logo}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#111827" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{p.city} · {p.type}</div>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#6b7280", marginTop: 2 }}>{p.email} · {p.phone}</div>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 28, color: "#3b82f6", lineHeight: 1 }}>{p.uthyrda}</div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>Uthyrda</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 28, color: "#10b981", lineHeight: 1 }}>{p.klara}</div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>Godkända</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 28, color: "#f59e0b", lineHeight: 1 }}>{p.pagar}</div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>Pågår</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <SecondaryBtn onClick={() => toast.success(`Kontaktar ${p.name}...`)} style={{ padding: "8px 14px", fontSize: 12 }}>Kontakta</SecondaryBtn>
                <PrimaryBtn onClick={() => { setManagePartner(p); setTab("Personal"); }} style={{ padding: "8px 14px", fontSize: 12 }}>Hantera</PrimaryBtn>
              </div>
            </div>

            {/* Workers table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["PERSON", "ROLL", "AVDELNING", "STARTDATUM", "FRAMSTEG", "STATUS"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.workers.map((w, i) => {
                  const barColor = w.progress === 100 ? "#10b981" : w.progress === 0 ? "#ef4444" : w.progress >= 50 ? "#f59e0b" : "#3b82f6";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 999, background: AVATAR[w.avatar].bg, color: AVATAR[w.avatar].color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{w.initials}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{w.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{w.role}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{w.dept}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{w.start}</td>
                      <td style={{ padding: "12px 14px", width: 160 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ width: `${w.progress}%`, height: "100%", background: barColor }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{w.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}><StatusBadge s={w.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {/* Add partner card */}
        <button onClick={() => setAddOpen(true)} style={{
          border: "1px dashed #e5e7eb", borderRadius: 10, padding: 32,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          background: "transparent", cursor: "pointer",
        }}>
          <Building2 size={40} color="#9ca3af" />
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#374151" }}>Lägg till bemanningspartner</div>
          <div style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>Klicka för att lägga till ett nytt bemanningsbolag</div>
          <span style={{ background: "#0b1e2d", color: "#fff", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>+ Lägg till</span>
        </button>
      </div>

      {/* Add modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Lägg till bemanningspartner</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Företagsnamn *", v: pName, s: setPName },
              { label: "Ort", v: pCity, s: setPCity },
              { label: "Beskrivning", v: pDesc, s: setPDesc },
              { label: "E-post", v: pEmail, s: setPEmail },
              { label: "Telefon", v: pPhone, s: setPPhone },
            ].map((f) => (
              <label key={f.label} style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{f.label}
                <input value={f.v} onChange={(e) => f.s(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
              </label>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <SecondaryBtn onClick={() => setAddOpen(false)}>Avbryt</SecondaryBtn>
              <PrimaryBtn onClick={() => {
                if (!pName.trim()) { toast.error("Företagsnamn krävs"); return; }
                toast.success("Partner tillagd!");
                setPName(""); setPCity(""); setPDesc(""); setPEmail(""); setPPhone("");
                setAddOpen(false);
              }}>Lägg till partner</PrimaryBtn>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage modal */}
      <Dialog open={!!managePartner} onOpenChange={(o) => !o && setManagePartner(null)}>
        <DialogContent>
          {managePartner && (
            <>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Hantera {managePartner.name}</div>
              <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
                {(["Personal", "Kontakt", "Avtal"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    background: "transparent", border: "none",
                    padding: "8px 14px", fontSize: 13, fontWeight: 600,
                    color: tab === t ? "#0b1e2d" : "#6b7280", cursor: "pointer",
                    borderBottom: tab === t ? "2px solid #0b1e2d" : "2px solid transparent",
                  }}>{t}</button>
                ))}
              </div>

              {tab === "Personal" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {managePartner.workers.map((w, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #f3f4f6", borderRadius: 8, fontSize: 13 }}>
                      <span>{w.name} — {w.role}</span>
                      <StatusBadge s={w.status} />
                    </div>
                  ))}
                </div>
              )}

              {tab === "Kontakt" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>E-post
                    <input defaultValue={managePartner.email} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
                  </label>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Telefon
                    <input defaultValue={managePartner.phone} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
                  </label>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Ort
                    <input defaultValue={managePartner.city} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
                  </label>
                </div>
              )}

              {tab === "Avtal" && (
                <div style={{ fontSize: 13, color: "#374151" }}>Inga avtalsdokument tillagda ännu.</div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <SecondaryBtn onClick={() => setManagePartner(null)}>Avbryt</SecondaryBtn>
                <PrimaryBtn onClick={() => { toast.success("Sparat!"); setManagePartner(null); }}>Spara</PrimaryBtn>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </LightAppShell>
  );
}
