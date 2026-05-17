import * as React from "react";
import { AppModal, Field, TextInput, GhostBtn, MintBtn } from "./AppModal";
import { toast } from "sonner";

export function AddCompanyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [namn, setNamn] = React.useState("");
  const [ort, setOrt] = React.useState("");
  const [epost, setEpost] = React.useState("");
  const [telefon, setTelefon] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namn.trim()) return;
    toast.success("Bemanningsbolag tillagt!");
    setNamn(""); setOrt(""); setEpost(""); setTelefon("");
    onClose();
  };

  return (
    <AppModal open={open} onClose={onClose} title="Lägg till bemanningsbolag" footer={
      <>
        <GhostBtn type="button" onClick={onClose}>Avbryt</GhostBtn>
        <MintBtn type="button" onClick={submit}>Lägg till</MintBtn>
      </>
    }>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Företagsnamn *"><TextInput value={namn} onChange={(e) => setNamn(e.target.value)} required /></Field>
        <Field label="Ort"><TextInput value={ort} onChange={(e) => setOrt(e.target.value)} /></Field>
        <Field label="E-post"><TextInput type="email" value={epost} onChange={(e) => setEpost(e.target.value)} /></Field>
        <Field label="Telefon"><TextInput value={telefon} onChange={(e) => setTelefon(e.target.value)} /></Field>
      </form>
    </AppModal>
  );
}
