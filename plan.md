# Admin Panel Overhaul Plan

## Problem
Admin-panelet er én monolittisk fil på 2100+ linjer (`admin/page.tsx`) med all logikk, state, UI og API-kall blandet sammen. Det er uoversiktlig og vanskelig å vedlikeholde.

## Arkitektur

### Ny mappestruktur
```
src/app/admin/
  layout.tsx              — Felles layout med sidebar-navigasjon + auth-guard
  page.tsx                — Dashboard (oversikt/statistikk)
  innhold/page.tsx        — Innholdsredigering (CMS)
  rsvp/page.tsx           — RSVP-administrasjon
  bordkart/page.tsx       — Bordkart-administrasjon

src/components/admin/
  AdminSidebar.tsx         — Navigasjon mellom admin-sider
  AdminAuthGuard.tsx       — Auth-sjekk wrapper (erstatter inline auth-logikk)

  content/
    HeroEditor.tsx         — Rediger hero-seksjon
    StoryEditor.tsx        — Rediger historie + tidslinje
    DetailsEditor.tsx      — Rediger praktisk info (sted, antrekk, mat, gaver, info)
    ScheduleEditor.tsx     — Rediger program
    RsvpContentEditor.tsx  — Rediger RSVP-tekster/labels
    FooterEditor.tsx       — Rediger footer

  rsvp/
    RsvpTable.tsx          — RSVP-tabell med filtrering/sortering
    RsvpStats.tsx          — Statistikk-kort (antall ja/nei/kanskje/ulest)
    RsvpExport.tsx         — Eksport-knapp

  seating/
    TableGrid.tsx          — Oversikt over alle bord
    TableEditor.tsx        — Rediger enkeltbord + gjester
    TableCreateForm.tsx    — Opprett nytt bord

src/hooks/admin/
  useAdminAuth.ts          — Auth-logikk (login, logout, check)
  useContent.ts            — Hent/lagre innhold (erstatter inline fetch)
  useRsvpAdmin.ts          — RSVP-data (henting, mark-read, eksport)
  useSeatingAdmin.ts       — Bordkart-CRUD

src/types/admin.ts         — Typedefs for ContentData, RSVPItem, SeatingTable, etc.
```

### Nøkkelprinsipper

1. **Separation of Concerns** — Hver side har én oppgave. Hver komponent håndterer én seksjon.
2. **Custom hooks** — All API-logikk i hooks, ikke i komponenter.
3. **Shared types** — Én kilde til sannhet for TypeScript-typer.
4. **Auth guard i layout** — Login-sjekk skjer én gang i `layout.tsx`, ikke i hver side.

## Gjennomføringsplan

### Steg 1: Typer og hooks
- Opprett `src/types/admin.ts` med alle interfaces (ContentData, RSVPItem, SeatingTable, etc.)
- Opprett custom hooks: `useAdminAuth`, `useContent`, `useRsvpAdmin`, `useSeatingAdmin`
- Ekstraher all fetch/API-logikk fra den monolittiske page.tsx

### Steg 2: Admin layout og auth
- Opprett `admin/layout.tsx` med sidebar-navigasjon og auth-guard
- Opprett `AdminSidebar.tsx` med lenker til de fire admin-sidene
- Opprett `AdminAuthGuard.tsx` som wrapper

### Steg 3: Dashboard (admin/page.tsx)
- Ny forside med oversikt: antall RSVP (ja/nei/kanskje), uleste, antall bord
- Hurtiglenker til de andre sidene

### Steg 4: Innholdsredigering (admin/innhold/page.tsx)
- Splitt innholdsredigering i separate editor-komponenter per seksjon
- Hver editor matcher frontend-komponentene 1:1
- Lagre-knapp øverst (sticky)
- Visuelt skille mellom seksjoner med tydelige overskrifter

### Steg 5: RSVP-administrasjon (admin/rsvp/page.tsx)
- Statistikk-kort øverst
- Søkbar/filtrerbar tabell
- Mark-as-read funksjonalitet
- Eksport-knapp

### Steg 6: Bordkart-administrasjon (admin/bordkart/page.tsx)
- Visuell oversikt over bord
- Opprett/rediger/slett bord
- Administrer gjester per bord

### Steg 7: Opprydding
- Slett gammel monolittisk `admin/page.tsx`
- Verifiser at alt fungerer med `npm run build`
