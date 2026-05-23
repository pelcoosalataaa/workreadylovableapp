# Byt GPT-modell i kursgenerering

## Problem
`src/lib/kurs.functions.ts` använder `openai/gpt-4o-mini` som inte längre tillåts av Lovable AI Gateway.

## Lösning
Byt till `google/gemini-3-flash-preview` (standard på Lovable AI – snabb och billig, fungerar bra för JSON-output).

## Ändring
**`src/lib/kurs.functions.ts`**: i GPT-anropet, ändra `model: "openai/gpt-4o-mini"` → `model: "google/gemini-3-flash-preview"`.
