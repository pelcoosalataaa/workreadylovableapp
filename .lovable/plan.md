## Inaktivera HIBP-lösenordskontroll

**Problem:** Supabase blockerar registrering med felet "password is known to be weak and easy to guess" eftersom HIBP-kontrollen är på.

**Lösning:** Anropa `configure_auth` med `password_hibp_enabled: false`. Inga filer behöver ändras.

**Notera:** Säkerhetsskannrar kan flagga detta som en svaghet — men det är ett medvetet val enligt önskemål.