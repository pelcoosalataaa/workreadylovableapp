import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell } from "@/components/LightAppShell";
import { PrimaryBtn, SecondaryBtn } from "@/components/AppTopBar";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  fetchPartners,
  fetchPersonal,
  initialsOf,
  statusLabel,
  type PartnerRow,
  type PersonRow,
} from "@/lib/workforce";

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

function avatarToneFor(status: string): Tone {
  if (status === "redo") return "green";
  if (status === "pagaende" || status === "pagar") return "amber";
  return "red";
}

function StatusBadge({ s }: { s: "Redo" | "Pågår" | "Ej påbörjat" | "Klar" }) {
  const m: Record<string, { bg: string; color: string }> = {
    Redo: { bg: "#d1fae5", color: "#065f46" },
    Klar: { bg: "#d1fae5", color: "#065f46" },
    Pågår: { bg: "#fef3c7", color: "#92400e" },
    "Ej påbörjat": { bg: "#fee2e2", color: "#991b1b" },
  };
  const t = m[s] ?? m["Ej påbörjat"];
  return <span style={{ background: t.bg, color: t.color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>{s}</span>;
}

function BemanningspartnersPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [personal, setPersonal] = useState<PersonRow[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [managePartner, setManagePartner] = useState<PartnerRow | null>(null);
  const [tab, setTab] = useState<"Personal" | "Kontakt" | "Avtal">("Personal");

  const [pName, setPName] = useState("");
  const [pCity, setPCity] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPhone, setPPhone] = useState("");

  const reload = async () => {
    const [pp, pl] = await Promise.all([fetchPartners(), fetchPersonal()]);
    setPartners(pp);
    setPersonal(pl);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (!s) navigate({ to: "/login" }); });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else { reload().finally(() => setReady(true)); }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const stats = useMemo(() => {
    const inhyrd = personal.filter((p) => !!p.bemanningsbolag);
    const klara = inhyrd.filter((p) => p.status === "redo").length;
    const ejKlara = inhyrd.length - klara;
    return [
      { label: "AKTIVA PARTNERS", value: String(partners.length), sub: "bemanningsbolag", color: "#3b82f6" },
      { label: "TOTALT UTHYRDA", value: String(inhyrd.length), sub: "aktiva medarbetare", color: "#10b981" },
      { label: "UNDER UPPLÄRNING", value: String(ejKlara), sub: "ej klara", color: "#f59e0b" },
    ];
  }, [partners, personal]);

  const workersFor = (partnerName: string) =>
    personal.filter((p) => p.bemanningsbolag === partnerName);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

  const addPartner = async () => {
    if (!pName.trim()) { toast.error("Företagsnamn krävs"); return; }
    const { error } = await supabase.from("bemanningspartners").insert({
      namn: pName.trim(), ort: pCity.trim() || null,
      epost: pEmail.trim() || null, telefon: pPhone.trim() || null,
    });
    if (error) { toast.error("Kunde inte spara"); return; }
    toast.success("Partner tillagd!");
    setPName(""); setPCity(""); setPDesc(""); setPEmail(""); setPPhone("");
    setAddOpen(false);
    reload();
  };

  return (
    <LightAppShell
      title="Bemanningspartners"
      action={<PrimaryBtn onClick={() => setAddOpen(true)}>+ Lägg till partner</PrimaryBtn>}
    >
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "20px 22px", borderLeft: `4px solid ${s.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 40, color: "#111827", lineHeight: 1.1, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Partner cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {partners.map((p) => {
          const workers = workersFor(p.namn);
          const klara = workers.filter((w) => w.status === "redo").length;
          const pagar = workers.filter((w) => w.status === "pagaende" || w.status === "pagar").length;
          const ej = workers.filter((w) => w.status === "ej_paborjat").length;
          const logoInitials = initialsOf(p.namn.split(" ")[0] ?? "P", p.namn.split(" ")[1] ?? "");
          return (
            <div key={p.id} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "#0b1e2d", color: "#7dedb8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 18 }}>{logoInitials}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#111827" }}>{p.namn}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{p.ort ?? "—"} · Bemanning & Rekrytering</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#6b7280", marginTop: 2 }}>{p.epost ?? "—"} · {p.telefon ?? "—"}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                    {workers.length} uthyrda · {pagar} pågår · {ej} ej påbörjat
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 28, color: "#3b82f6", lineHeight: 1 }}>{workers.length}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>Uthyrda</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 28, color: "#10b981", lineHeight: 1 }}>{klara}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>Klara</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 28, color: "#f59e0b", lineHeight: 1 }}>{pagar}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>Pågår</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <SecondaryBtn onClick={() => toast.success(`Kontaktar ${p.namn}...`)} style={{ padding: "8px 14px", fontSize: 12 }}>Kontakta</SecondaryBtn>
                  <PrimaryBtn onClick={() => { setManagePartner(p); setTab("Personal"); }} style={{ padding: "8px 14px", fontSize: 12 }}>Hantera</PrimaryBtn>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["PERSON", "ROLL", "AVDELNING", "FRAMSTEG", "STATUS"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => {
                    const tone = avatarToneFor(w.status);
                    const barColor = w.framsteg === 100 ? "#10b981" : w.framsteg === 0 ? "#ef4444" : w.framsteg >= 50 ? "#f59e0b" : "#3b82f6";
                    const label = statusLabel(w.status);
                    return (
                      <tr key={w.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 999, background: AVATAR[tone].bg, color: AVATAR[tone].color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{initialsOf(w.fornamn, w.efternamn)}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{w.fornamn} {w.efternamn}</div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{w.roll ?? "—"}</td>
                        <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{w.avdelning_namn ?? "—"}</td>
                        <td style={{ padding: "12px 14px", width: 160 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                              <div style={{ width: `${w.framsteg}%`, height: "100%", background: barColor }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{w.framsteg}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}><StatusBadge s={label} /></td>
                      </tr>
                    );
                  })}
                  {workers.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", fontSize: 13, color: "#6b7280" }}>Inga uthyrda just nu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}

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
              <PrimaryBtn onClick={addPartner}>Lägg till partner</PrimaryBtn>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage modal */}
      <Dialog open={!!managePartner} onOpenChange={(o) => !o && setManagePartner(null)}>
        <DialogContent>
          {managePartner && (
            <>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Hantera {managePartner.namn}</div>
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
                  {workersFor(managePartner.namn).map((w) => (
                    <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #f3f4f6", borderRadius: 8, fontSize: 13 }}>
                      <span>{w.fornamn} {w.efternamn} — {w.roll ?? ""}</span>
                      <StatusBadge s={statusLabel(w.status)} />
                    </div>
                  ))}
                </div>
              )}

              {tab === "Kontakt" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>E-post
                    <input defaultValue={managePartner.epost ?? ""} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
                  </label>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Telefon
                    <input defaultValue={managePartner.telefon ?? ""} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
                  </label>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Ort
                    <input defaultValue={managePartner.ort ?? ""} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
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
