# Plan

## Vad jag ska fixa
1. Lägga till radera-funktionen i chefens kurslista på dashboarden, eftersom den vyn just nu bara visar kurser utan någon raderingskontroll.
2. Återanvända samma bekräftelsedialog och serveranrop som redan finns på kurssidan så beteendet blir konsekvent.
3. Uppdatera listan och statistiken direkt efter radering så kursen försvinner direkt från gränssnittet.
4. Verifiera att raderingen fungerar både från dashboarden och från sidan `/kurser`.

## Tekniska detaljer
- Uppdatera `src/routes/dashboard.tsx` med delete-knapp för varje kursrad.
- Behålla `taBortKurs` i `src/lib/kurs.functions.ts` som serverlogik och koppla dashboarden till den via `useServerFn`.
- Säkerställa lokal state-uppdatering för både `senaste` och `stats.kurser` efter lyckad radering.
- Om jag hittar ett UI-flödesfel i `/kurser` samtidigt, justerar jag bara det som krävs för att radering ska fungera konsekvent där också.