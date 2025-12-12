# Vercel Miljøvariabel Setup

## ADMIN_PASSWORD (Påkrevd)

For å kunne bruke admin-siden (`/admin`), må du sette opp miljøvariabelen `ADMIN_PASSWORD` i Vercel.

## COOKIE_SECRET (Anbefalt)

For bedre sikkerhet, sett også opp `COOKIE_SECRET` for å signere cookies. Hvis ikke satt, brukes `ADMIN_PASSWORD` som fallback.

### Generert passord
**Passord:** `M5yTeFdRGP4nLB7ncugcmg4KB`

⚠️ **VIKTIG:** Dette passordet er generert automatisk. Lagre det på et sikkert sted!

### Slik setter du opp i Vercel:

1. Gå til [Vercel Dashboard](https://vercel.com/dashboard)
2. Velg prosjektet ditt (`bryllupsnettside`)
3. Gå til **Settings** → **Environment Variables**
4. Legg til ny variabel:
   - **Name:** `ADMIN_PASSWORD`
   - **Value:** `M5yTeFdRGP4nLB7ncugcmg4KB`
   - **Environment:** Velg alle (Production, Preview, Development)
5. Klikk **Save**
6. Gå til **Deployments** og redeploy den siste deploymenten (eller vent til neste automatisk deploy)

### Alternativ: Via Vercel CLI

```bash
cd my-app
vercel login
vercel env add ADMIN_PASSWORD production preview development
# Når du blir bedt om verdi, skriv inn: M5yTeFdRGP4nLB7ncugcmg4KB
```

### Bruk av admin-siden

Etter at miljøvariabelen er satt opp:
1. Gå til `https://din-domene.no/admin`
2. Logg inn med passordet: `M5yTeFdRGP4nLB7ncugcmg4KB`
3. Rediger innholdet og klikk "Lagre alle endringer"

### Endre passord

Hvis du vil endre passordet senere:
1. Generer et nytt passord: `openssl rand -base64 32 | tr -d "=+/" | cut -c1-25`
2. Oppdater `ADMIN_PASSWORD` i Vercel med det nye passordet
3. Redeploy prosjektet

