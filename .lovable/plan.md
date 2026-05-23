# Fixa Whisper 404 vid videouppladdning

## Problem
`src/lib/kurs.functions.ts` anropar `https://ai.gateway.lovable.dev/v1/audio/transcriptions`, men Lovable AI Gateway exponerar inte Whisper-endpointen → 404.

## Lösning
Anropa OpenAI:s Whisper API direkt med befintlig `OPENAI_API_KEY`-secret. GPT-anropet (kursgenereringen) lämnas kvar på Lovable AI Gateway.

## Ändring
**`src/lib/kurs.functions.ts`** – i `skapaKursMedAi.handler`:
- Läs `process.env.OPENAI_API_KEY` (kasta fel om saknas).
- Byt fetch-URL till `https://api.openai.com/v1/audio/transcriptions`.
- Byt header från `Lovable-API-Key` till `Authorization: Bearer ${OPENAI_API_KEY}`.
- Behåll FormData (file, model=`whisper-1`, language=`sv`).
- Behåll övrig logik (signed URL, GPT-anrop via Lovable AI, insert).

Inga andra filer påverkas. Inga nya secrets behövs.
