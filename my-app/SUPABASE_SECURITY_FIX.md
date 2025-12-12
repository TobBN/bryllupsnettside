# Supabase Security Fixes

## Kritisk: RLS (Row Level Security) ikke aktivert

Supabase Database Linter har funnet kritiske sikkerhetsproblemer som må fikses.

## Problemer funnet

### 🔴 KRITISK (ERROR)
1. **RLS ikke aktivert på `website_content`** - Tabellen er tilgjengelig uten sikkerhet
2. **RLS ikke aktivert på `rsvps`** - RSVP-data er tilgjengelig uten sikkerhet

### 🟡 WARNING
3. **Function search_path mutable** - Sikkerhetsrisiko i `update_updated_at_column` funksjonen

### ℹ️ INFO (Ikke kritisk)
4. **Unused indexes** - Kan fjernes for bedre ytelse, men ikke kritisk

## Løsning

Kjør `supabase_security_fix.sql` i Supabase SQL Editor:

1. Gå til Supabase Dashboard → SQL Editor
2. Åpne filen `supabase_security_fix.sql`
3. Kopier hele innholdet
4. Lim inn i SQL Editor
5. Klikk **Run**

## Hva gjør fiksen?

### RLS Policies

**website_content:**
- ✅ Alle kan lese (for nettsiden)
- ✅ Kun service_role kan skrive (via API med autentisering)

**rsvps:**
- ✅ Alle kan legge til nye RSVP-svar (via skjemaet)
- ✅ Kun service_role kan lese/eksportere (via admin-panel)

### Function Security
- ✅ Fikser `search_path` sikkerhetsproblem

## Verifisering

Etter å ha kjørt fiksen:
1. Gå til Supabase Dashboard → Database Linter
2. Verifiser at alle ERROR og WARNING er borte
3. Test at admin-panel fortsatt fungerer
4. Test at RSVP-skjemaet fortsatt fungerer

## Viktig

**Dette må gjøres ASAP** for å sikre databasen din!

