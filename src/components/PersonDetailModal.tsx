import * as React from "react";
import { AppModal } from "./AppModal";

export type PersonDetail = {
  name: string;
  role?: string;
  dept?: string;
  company?: string;
  start?: string;
  percent?: number;
  status?: string;
  certs?: string;
};

function statusStyle(status?: string): React.CSSProperties {
  if (!status) return {};
  if (status.toLowerCase().includes("godkän")) return { background: "rgba(0,224,150,0.1)", color: "#00e096", border: "1px solid rgba(0,224,150,0.2)" };
  if (status.toLowerCase().includes("pågår") || status.toLowerCase().includes("pagar")) return { background: "rgba(255,209,102,0.1)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.2)" };
  return { background: "rgba(255,77,106,0.1)", color: "#ff4d6a", border: "1px solid rgba(255,77,106,0.2)" };
}

const labelCss: React.CSSProperties = { fontFamily: "'Space Mono', ui-monospace, monospace", fontSize: 9, color: "#6a9ab0", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 };

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <div style={labelCss}>{label}</div>
      <div style={{ color: "#edfaf4", fontSize: 13 }}>{value}</div>
    </div>
  );
}

export function PersonDetailModal({ open, onClose, person }: { open: boolean; onClose: () => void; person: PersonDetail | null }) {
  if (!person) return null;
  return (
    <AppModal open={open} onClose={onClose} title={person.name}>
      <Row label="Roll" value={person.role} />
      <Row label="Avdelning" value={person.dept} />
      <Row label="Bemanningsbolag" value={person.company} />
      <Row label="Startdatum" value={person.start} />
      {typeof person.percent === "number" && (
        <div>
          <div style={labelCss}>Framsteg</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 4, background: "#1a3d58", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${person.percent}%`, height: "100%", background: "#7dedb8" }} />
            </div>
            <span style={{ fontSize: 12, color: "#7dedb8", fontWeight: 700 }}>{person.percent}%</span>
          </div>
        </div>
      )}
      {person.status && (
        <div>
          <div style={labelCss}>Status</div>
          <span style={{ ...statusStyle(person.status), fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, display: "inline-block" }}>{person.status}</span>
        </div>
      )}
      <Row label="Certifikat" value={person.certs} />
    </AppModal>
  );
}
