# Internet.nl runbook (www.alexandraogtobias.no)

## Hva vi kan fikse i repo (kode/config)

### Security headers
Headers settes i `my-app/src/middleware.ts`.

Målet er å få Internet.nl til å gi “Passed” på **Security options** ved å:
- ha en streng CSP (uten `unsafe-inline`/`unsafe-eval` i `script-src`)
- unngå brede schema-allowances (f.eks. `img-src https:`)
- sette en anbefalt `Referrer-Policy`
- ha en korrekt `/.well-known/security.txt`

### Verifisering (curl)
Kjør:

```bash
curl -I https://www.alexandraogtobias.no/
```

Sjekk at disse finnes i responsen:
- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`

Sjekk security.txt:

```bash
curl -I https://www.alexandraogtobias.no/.well-known/security.txt
curl https://www.alexandraogtobias.no/.well-known/security.txt
```

## Ting som må gjøres utenfor repo (DNS/hosting)

### DNSSEC (One.com / registrar)
Internet.nl “DNSSEC FAIL” betyr at sonen ikke er signert.

Gjør dette hos DNS/registrar-leverandøren:
1. Slå på **DNSSEC** for sonen.
2. Publiser **DS-record** (hvis leverandøren krever det manuelt).
3. Verifiser:
   - Kjør Internet.nl på nytt
   - (valgfritt) `dig +dnssec www.alexandraogtobias.no A`

### IPv6 (AAAA) / Internet.nl “IPv6 FAIL”
Vercel støtter ikke et “ekte” AAAA-oppsett som Internet.nl forventer direkte på origin i mange oppsett.

Pragmatiske alternativer:
1. **Cloudflare proxy** foran Vercel:
   - Sett Cloudflare som DNS for domenet
   - Slå på proxy (orange cloud) for `www`
   - Cloudflare annonserer IPv6 ut mot klienter og kan snakke IPv4 mot Vercel
2. **Bytte hosting/CDN** til leverandør som tilbyr AAAA/IPv6 direkte.

### HTTP compression (BREACH) i Internet.nl
På Vercel håndteres gzip/brotli normalt på edge/CDN og er ofte ikke granular å slå av kun for HTML.

Pragmatiske mitigasjoner (app-nivå):
- ikke reflekter secrets/tokens i HTML-responses
- ikke bruk secrets i query params
- unngå å inkludere sensitiv data i komprimerte responses som også reflekterer attacker-controlled input

## Retest
Etter deploy:
1. Kjør Internet.nl test på nytt.
2. Forventet forbedring:
   - “Security options” skal gå fra “Recommendation” til “Passed” (CSP + Referrer-Policy + security.txt).


