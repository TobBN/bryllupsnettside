# Supabase Setup Guide

## Steg 1: Opprett Supabase-prosjekt

1. Gå til [Supabase Dashboard](https://app.supabase.com)
2. Klikk **New Project**
3. Fyll ut:
   - **Name:** bryllupsnettside (eller hva du vil)
   - **Database Password:** Velg et sikkert passord (lagre dette!)
   - **Region:** Velg nærmeste region (f.eks. West Europe)
4. Klikk **Create new project**
5. Vent ~2 minutter mens prosjektet opprettes

## Steg 2: Kjør SQL-migrasjon

1. I Supabase Dashboard, gå til **SQL Editor** (venstre meny)
2. Klikk **New query**
3. Åpne filen `supabase_migration_complete.sql` i prosjektet
4. Kopier **hele** innholdet
5. Lim inn i SQL Editor
6. Klikk **Run** (eller trykk Cmd/Ctrl + Enter)
7. Du skal se "Success. No rows returned"

## Steg 3: Hent API-nøkler

1. I Supabase Dashboard, gå til **Settings** → **API**
2. Finn disse verdiene:
   - **Project URL** (f.eks. `https://xxxxx.supabase.co`)
   - **service_role key** (under "Project API keys", den som starter med `eyJ...`)

⚠️ **VIKTIG:** Bruk `service_role` key, IKKE `anon` key!

## Steg 4: Sett miljøvariabler i Vercel

1. Gå til [Vercel Dashboard](https://vercel.com/dashboard)
2. Velg prosjektet `bryllupsnettside`
3. Gå til **Settings** → **Environment Variables**
4. Legg til følgende variabler:

### Variabel 1: NEXT_PUBLIC_SUPABASE_URL
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Project URL fra Supabase (f.eks. `https://xxxxx.supabase.co`)
- **Environment:** Velg alle (Production, Preview, Development)

### Variabel 2: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** service_role key fra Supabase
- **Environment:** Velg alle (Production, Preview, Development)

### Variabel 3: ADMIN_PASSWORD (hvis ikke allerede satt)
- **Name:** `ADMIN_PASSWORD`
- **Value:** `M5yTeFdRGP4nLB7ncugcmg4KB` (eller ditt eget passord)
- **Environment:** Velg alle

5. Klikk **Save** for hver variabel

## Steg 5: Redeploy

1. Gå til **Deployments** i Vercel
2. Klikk på den siste deploymenten
3. Klikk **Redeploy** → **Redeploy**

Eller vent til neste automatisk deploy når du pusher til GitHub.

## Verifisering

Etter deploy, test:

1. **Admin-panel:** Gå til `/admin` og logg inn
2. **RSVP:** Send et test-svar via RSVP-skjemaet
3. **Supabase:** Gå til Supabase → Table Editor → `rsvps` og se at svaret er lagret

## Feilsøking

**Feil: "Supabase env vars missing"**
- Sjekk at miljøvariablene er satt i Vercel
- Sjekk at du har redeployet etter å ha satt variablene

**Feil: "relation does not exist"**
- Sjekk at SQL-migrasjonen er kjørt
- Gå til Supabase → Table Editor og se om tabellene eksisterer

**Feil: "permission denied"**
- Sjekk at du bruker `service_role` key, ikke `anon` key

