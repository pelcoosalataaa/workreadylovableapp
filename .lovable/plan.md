## Problem

After yesterday's security migration, every authenticated page (`/`, `/kurser`, `/dashboard`, etc.) hangs on "Laddar…".

Root cause: migration `20260523213516_…sql` ran

```sql
REVOKE EXECUTE ON FUNCTION public.get_foretag_id(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_roll(uuid)       FROM PUBLIC, anon, authenticated;
```

based on the assumption that "RLS policies run as the table owner". That's incorrect — RLS policy expressions are evaluated with the **calling user's** privileges. Since these helpers are referenced inside the SELECT policies on `anvandare`, `kurser`, `resultat`, etc., every authenticated query against those tables now errors out with `permission denied for function`. The client swallows the error and `profil` stays `null`, so the `Laddar…` guard in `kurser.tsx` / `index.tsx` never resolves.

The original security finding (`SUPA_authenticated_security_definer_function_executable`) was a false positive in this codebase: both helpers are `SECURITY DEFINER` with a locked `search_path` and only return the caller's own `foretag_id` / `roll` — safe to expose to `authenticated`.

## Fix

Single migration that re-grants EXECUTE:

```sql
GRANT EXECUTE ON FUNCTION public.get_foretag_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_roll(uuid)       TO authenticated;
```

Then update `@security-memory` to record that this finding is intentionally ignored for these two helpers (with the reasoning above) so a future scan doesn't regress us.

No frontend changes needed — the loading screen is a symptom, not the bug.

## Verification

1. Reload `https://workreadylovableapp.lovable.app/kurser` while logged in → page should render with the course list.
2. Reload `/` → should redirect to `/dashboard` (chef) or `/kurser` (anställd).
