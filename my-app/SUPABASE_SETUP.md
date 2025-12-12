# Supabase Setup for Website Content

## Database Migration

For å kunne bruke admin-panelet må du kjøre en SQL-migrasjon i Supabase.

### Steg 1: Gå til Supabase Dashboard

1. Gå til [Supabase Dashboard](https://app.supabase.com)
2. Velg prosjektet ditt
3. Gå til **SQL Editor** i venstre meny

### Steg 2: Kjør migrasjonen

1. Åpne filen `supabase_migration.sql` i prosjektet
2. Kopier hele innholdet
3. Lim inn i SQL Editor i Supabase
4. Klikk **Run** eller trykk Cmd/Ctrl + Enter

### Steg 3: Verifiser

Etter migrasjonen skal du ha:
- En ny tabell `website_content` med én rad (`id = 'main'`)
- Innholdet fra `content.json` skal være lagret i databasen

## Hva endres?

- **Før:** Innhold ble lagret i `data/content.json` fil (fungerer ikke på Vercel)
- **Etter:** Innhold lagres i Supabase database (fungerer på alle plattformer)

## Feilsøking

Hvis du får feilmelding "Kunne ikke lagre innhold":
1. Sjekk at migrasjonen er kjørt
2. Sjekk at `NEXT_PUBLIC_SUPABASE_URL` og `SUPABASE_SERVICE_ROLE_KEY` er satt i Vercel
3. Sjekk Supabase logs for feilmeldinger

