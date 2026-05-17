import * as React from "react";

export function AppModal({ open, onClose, title, children, footer, maxWidth = 480 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; maxWidth?: number }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 12, padding: 32, width: "100%", maxWidth, maxHeight: "90vh", overflowY: "auto" }}>
        <h3 className="font-display font-bold text-white" style={{ fontSize: 20, marginBottom: 20 }}>{title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
        {footer && <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>{footer}</div>}
      </div>
    </div>
  );
}

export const labelCls: React.CSSProperties = { fontFamily: "'Space Mono', ui-monospace, monospace", fontSize: 9, color: "#6a9ab0", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6, display: "block" };

export const inputCls = "w-full outline-none focus:border-[#7dedb8] transition-colors";
export const inputStyle: React.CSSProperties = { background: "#060f18", border: "1px solid #1a3d58", borderRadius: 6, padding: "10px 14px", color: "white", fontSize: 13, width: "100%" };

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={labelCls}>{label}</label>{children}</div>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} style={inputStyle} />;
}

export function SelectInput({ options, ...props }: { options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={inputCls} style={inputStyle}>
      <option value="">Välj...</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputCls} style={{ ...inputStyle, minHeight: 80, fontFamily: "inherit" }} />;
}

export function GhostBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ background: "transparent", border: "1px solid #1a3d58", color: "#edfaf4", borderRadius: 6, padding: "9px 16px", fontSize: 12, fontWeight: 600 }}>{children}</button>;
}

export function MintBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ background: "#7dedb8", color: "#060f18", border: "none", borderRadius: 6, padding: "9px 16px", fontSize: 12, fontWeight: 700 }}>{children}</button>;
}
