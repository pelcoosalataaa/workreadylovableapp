import * as React from "react";
import { AppModal, Field, TextInput, GhostBtn, MintBtn } from "./AppModal";
import { toast } from "sonner";

export type ManageCompanyData = {
  name: string;
  city?: string;
  email?: string;
  phone?: string;
  uthyrda: number;
  godkanda: number;
  pagar: number;
  personnel: { name: string; status: string }[];
};

const labelCss: React.CSSProperties = { fontFamily: "'Space Mono', ui-monospace, monospace", fontSize: 9, color: "#6a9ab0", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 };

function statusStyle(status: string): React.CSSProperties {
  if (status.toLowerCase().includes("godkän")) return { background: "rgba(0,224,150,0.1)", color: "#00e096", border: "1px solid rgba(0,224,150,0.2)" };
  if (status.toLowerCase().includes("pågår")) return { background: "rgba(255,209,102,0.1)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.2)" };
  return { background: "rgba(255,77,106,0.1)", color: "#ff4d6a", border: "1px solid rgba(255,77,106,0.2)" };
}

export function ManageCompanyModal({ open, onClose, data }: { open: boolean; onClose: () => void; data: ManageCompanyData | null }) {
  const [form, setForm] = React.useState({ name: "", city: "", email: "", phone: "" });
  React.useEffect(() => { if (data) setForm({ name: data.name, city: data.city || "", email: data.email || "", phone: data.phone || "" }); }, [data]);

  if (!data) return null;
  const save = () => { toast.success("Bolag uppdaterat!"); onClose(); };

  return (
    <AppModal open={open} onClose={onClose} title={`Hantera ${data.name}`} maxWidth={560} footer={
      <>
        <GhostBtn type="button" onClick={onClose}>Avbryt</GhostBtn>
        <MintBtn type="button" onClick={save}>Spara</MintBtn>
      </>
    }>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Uthyrda", value: data.uthyrda, color: "#60b0f4" },
          { label: "Godkända", value: data.godkanda, color: "#00e096" },
          { label: "Pågår", value: data.pagar, color: "#ffd166" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#060f18", border: "1px solid #1a3d58", borderRadius: 8, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
            <div style={labelCss}>{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={labelCss}>Personal</div>
        <div style={{ background: "#060f18", border: "1px solid #1a3d58", borderRadius: 6, maxHeight: 140, overflowY: "auto" }}>
          {data.personnel.map((p, i) => (
            <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: i === data.personnel.length - 1 ? "none" : "1px solid #1a3d58" }}>
              <span style={{ fontSize: 12, color: "#edfaf4" }}>{p.name}</span>
              <span style={{ ...statusStyle(p.status), fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>

      <Field label="Företagsnamn"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Ort"><TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
      <Field label="E-post"><TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Telefon"><TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
    </AppModal>
  );
}
