# Sikkerhetsgjennomgang - OWASP Top 10

## Identifiserte sårbarheter

### 🔴 KRITISK

1. **A07:2021 – Identification and Authentication Failures**
   - ❌ Ingen rate limiting på login-endpoint
   - ❌ Timing attack sårbarhet (string comparison)
   - ❌ Ingen account lockout ved feil passord
   - ❌ Cookie expires i 7 dager (for lang session)

2. **A01:2021 – Broken Access Control**
   - ❌ Cookie-verdien er ikke signert/encrypted (kan manipuleres)
   - ❌ Ingen CSRF protection
   - ❌ Ingen session timeout

3. **A02:2021 – Cryptographic Failures**
   - ⚠️ Cookie-verdien er ikke signert (kan manipuleres)
   - ⚠️ Ingen password hashing (men passord er i miljøvariabel)

### 🟡 HØY RISIKO

4. **A03:2021 – Injection**
   - ⚠️ JSON parsing uten strukturvalidering
   - ⚠️ File write uten path validation
   - ⚠️ Ingen input sanitization på content

5. **A05:2021 – Security Misconfiguration**
   - ⚠️ Default password 'admin123' i development
   - ⚠️ Secure flag kun i production
   - ⚠️ Ingen rate limiting

6. **A09:2021 – Security Logging and Monitoring Failures**
   - ⚠️ Ingen logging av failed login attempts
   - ⚠️ Ingen logging av admin actions (content changes)

## Foreslåtte fikser

1. Legg til rate limiting på login
2. Bruk konstant-tid string comparison
3. Signer cookie-verdien med JWT eller signert cookie
4. Reduser session timeout til 2 timer
5. Legg til CSRF tokens
6. Valider og sanitize all input
7. Logg alle sikkerhetsrelevante events
8. Legg til account lockout etter X feilede forsøk

