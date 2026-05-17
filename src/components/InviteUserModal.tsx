import * as React from "react";
import { AppModal, Field, TextInput, SelectInput, GhostBtn, MintBtn } from "./AppModal";
import { toast } from "sonner";

const ROLLER = ["Admin", "Chef", "Teamledare", "Operatör"];

export function InviteUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [namn, setNamn] = React.useState("");
  const [epost, setEpost] = React.useState("");
  const [roll, setRoll] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Inbjudan skickad!");
    setNamn(""); setEpost(""); setRoll("");
    onClose();
  };

  return (
    <AppModal open={open} onClose={onClose} title="Bjud in användare" footer={
      <>
        <GhostBtn type="button" onClick={onClose}>Avbryt</GhostBtn>
        <MintBtn type="button" onClick={submit}>Bjud in</MintBtn>
      </>
    }>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Namn"><TextInput value={namn} onChange={(e) => setNamn(e.target.value)} required /></Field>
        <Field label="E-post"><TextInput type="email" value={epost} onChange={(e) => setEpost(e.target.value)} required /></Field>
        <Field label="Roll"><SelectInput options={ROLLER} value={roll} onChange={(e) => setRoll(e.target.value)} /></Field>
      </form>
    </AppModal>
  );
}
