# Klona Ready2Work — ersätt nuvarande app

Den uppladdade zip:en är ett separat TanStack Start-projekt med ett enklare datamodell och 7 sidor. Vi byter ut allt i nuvarande projekt så att det matchar zip:en 1:1.

## 1. Databas (migration)

Ta bort gammalt schema och lägg in det nya. Hela `personal`, `moduler`, `foretag`, `avdelningar`, `certifikat`, `bemanningspartners` rensas.

Nytt schema (från zip:ens migration):
- **anvandare** (`id` → auth.users, `foretag_id`, `foretag_namn`, `namn`, `epost`, `roll` 'chef'|'anstalld', `skapad_at`) + RLS
- **kurser** (`id`, `foretag_id`, `titel`, `steg` jsonb, `quiz` jsonb, `transkription`, `skapad_at`) + RLS
- **resultat** (`id`, `kurs_id` FK kurser, `anvandare_id` FK auth.users, `godkand`, `poang`, `skapad_at`) + RLS
- security-definer-funktioner `get_foretag_id`, `get_roll`
- privat storage-bucket **kurser** + RLS (chefer kan ladda upp/läsa videor i sin egen mapp)
- befintlig storage-bucket `moduler` tas bort

Befintlig edge-funktion `send-sms` lämnas orörd (oberoende).

## 2. Routes (`src/routes/`)

Tas bort: `arbetskraft.tsx`, `avdelning.tsx`, `bemanningsbolag.tsx`, `bemanningspartners.tsx`, `certifikat.tsx`, `inhyrd-personal.tsx`, `installningar.tsx`, `kompetensmatris.tsx`, `mobil.tsx`, `modul.$id.tsx`, `moduler.tsx`, `personal.tsx`, `spela-in.tsx`, `utbildning.tsx`, `utgaende-certifikat.tsx`.

Skapas/ersätts från zip (oförändrade):
- `__root.tsx` — wrap i `AuthProvider` + sonner Toaster
- `index.tsx` — redirect baserat på roll
- `login.tsx`, `registrera.tsx`
- `dashboard.tsx` (chef)
- `anstallda.tsx` (chef, bjud in via server-fn)
- `kurser.tsx` (anställd lista)
- `kurs.$id.tsx` (steg → quiz → resultat, godkänd ≥ 6/8)
- `ladda-upp.tsx` (upload → server-fn skapar kurs)

## 3. Komponenter & lib

- Nytt: `src/components/Topbar.tsx` (från zip)
- Tas bort: `AppSidebar.tsx`, `AppTopBar.tsx`, `LightAppShell.tsx`, `AddCompanyModal`, `InvitePersonalModal`, `InviteUserModal`, `ManageCompanyModal`, `PersonDetailModal`, `AppModal`
- shadcn `ui/*` behålls
- Nytt: `src/lib/auth.tsx` (AuthProvider)
- Nytt server-fns: `src/lib/anstallda.functions.ts` (inviteUserByEmail via service role), `src/lib/kurs.functions.ts` (Whisper + GPT, behöver `OPENAI_API_KEY` — finns)
- Tas bort: `src/lib/moduler.functions.ts`, `src/lib/workforce.ts`, `src/lib/departments.ts`

## 4. Design / styles.css

Ersätts med zip:ens tema:
- Font: **Plus Jakarta Sans**
- Bakgrund beige `#F5F0E8`, primary royal blue `#1B3A6B`, vit card, oklch-tokens
- `.card-shadow` utility
- Befintliga gröna/mörkblå WorkReady-tokens försvinner

## 5. Auth-konfig

- Standard e-post/lösenord (ingen Google) — zip använder bara `signInWithPassword` / `signUp`
- E-postverifiering **PÅ** (registrera-flödet visar "Kolla din e-post")
- Befintlig auth-attacher i `src/start.ts` behålls (krävs för server-fns)

## Resultat

Efter detta är projektet identiskt med Ready2Work-zip:en: chef registrerar företag → laddar upp video → AI gör kurs (6 steg + 8 quiz) → bjuder in anställda via e-post → anställda loggar in, kör kurs, godkänns vid ≥6/8.

Säg till om jag ska köra igång — då växlar du till Build mode.
