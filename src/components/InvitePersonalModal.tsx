import * as React from "react";
import { AppModal, Field, TextInput, SelectInput, GhostBtn, MintBtn } from "./AppModal";
import { toast } from "sonner";

const ROLLER = ["Gjutare", "Armerare", "Formbyggare", "Betongarbetare", "Efterbehandlare", "Kranförare"];
const BOLAG = ["Byggelement AB", "Partner2Work AB"];
const AVDELNINGAR = ["Snickeriavdelning / Formbyggnad", "Gul hallen", "Rosa hallen", "Gröna hallen", "Armeringsavdelning", "Lap och Lag"];

export function InvitePersonalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [namn, setNamn] = React.useState("");
  const [epost, setEpost] = React.useState("");
  const [roll, setRoll] = React.useState("");
  const [avd, setAvd] = React.useState("");
  const [bolag, setBolag] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Inbjudan skickad!");
    setNamn(""); setEpost(""); setRoll(""); setAvd(""); setBolag("");
    onClose();
  };

  return (
    <AppModal open={open} onClose={onClose} title="Bjud in personal" footer={
      <>
        <GhostBtn type="button" onClick={onClose}>Avbryt</GhostBtn>
        <MintBtn type="button" onClick={submit}>Bjud in</MintBtn>
      </>
    }>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Namn"><TextInput value={namn} onChange={(e) => setNamn(e.target.value)} required /></Field>
        <Field label="E-post"><TextInput type="email" value={epost} onChange={(e) => setEpost(e.target.value)} required /></Field>
        <Field label="Roll"><SelectInput options={ROLLER} value={roll} onChange={(e) => setRoll(e.target.value)} /></Field>
        <Field label="Avdelning"><TextInput value={avd} onChange={(e) => setAvd(e.target.value)} /></Field>
        <Field label="Bemanningsbolag"><SelectInput options={BOLAG} value={bolag} onChange={(e) => setBolag(e.target.value)} /></Field>
      </form>
    </AppModal>
  );
}
