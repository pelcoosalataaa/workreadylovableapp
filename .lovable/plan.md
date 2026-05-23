## Problem

På `/registrera` skapas användaren med `supabase.auth.signUp`, men eftersom e-postbekräftelse är på finns ingen session direkt efteråt. När klienten sen försöker köra `insert into anvandare` blockerar RLS-policyn `skapa egen rad` (`id = auth.uid()`) eftersom `auth.uid()` är `null` utan session → "new row violates row-level security policy".

## Lösning

Flytta skapandet av `anvandare`-raden till en server function som använder admin-klienten (service role), så att raden kan skapas direkt vid registrering oavsett om e-post är bekräftad eller ej. RLS-policyn för INSERT behålls som skydd för vanliga klientanrop.

### Steg

1. **Ny server function** `src/lib/registrera.functions.ts`
   - `skapaForetagsChef({ userId, foretagNamn, namn, epost })`
   - Ingen `requireSupabaseAuth` (session finns ej ännu vid email-confirm).
   - Validerar input med Zod (längder, epost-format).
   - Använder `supabaseAdmin` för att:
     - Verifiera att `userId` finns i `auth.users` och att e-posten matchar (skydd mot att skapa rad för annans uid).
     - Avvisa om en `anvandare`-rad redan finns för det `id`.
     - Sätter in raden med `roll: 'chef'`, `foretag_id = userId`.

2. **Uppdatera `src/routes/registrera.tsx`**
   - Efter `supabase.auth.signUp`, anropa `skapaForetagsChef` istället för att göra `supabase.from("anvandare").insert(...)` på klienten.
   - Behåll övrig logik (toasts, navigation, email-confirm-meddelande).

### Tekniska detaljer

- Server function ligger i `src/lib/` (inte `src/server/`) så den kan importeras från route-komponenten.
- `supabaseAdmin` läses från `@/integrations/supabase/client.server` inuti `.handler()`.
- Befintliga RLS-policys på `anvandare` rörs inte.
