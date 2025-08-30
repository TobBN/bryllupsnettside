# Alexandra & Tobias - Bryllupsnettside

En elegant og responsiv nettside for bryllupet til Alexandra og Tobias, bygget med moderne web-teknologier.

## 🚀 Teknologier

- **Next.js 15** - React-rammeverk med App Router
- **TypeScript** - Type-sikker JavaScript
- **Tailwind CSS** - Utility-first CSS-rammeverk
- **React Hooks** - State management og sideeffekter

## 🎨 Design

Nettsiden bruker en elegant fargepalett med:
- **Velvet** (#2D1B3D) - Dyp lilla for sofistikasjon
- **Pink** (#E8B4B8) - Romantisk rosa
- **Apricot** (#F4A261) - Varm oransje
- **Cream** (#FEFAE0) - Lys beige

## 📁 Prosjektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Globale stiler og CSS-variabler
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Hovedside
├── components/             # Modulære React-komponenter
│   ├── index.ts           # Komponent eksporter
│   ├── DecorativeLine.tsx # Dekorativ linje
│   ├── CountdownCard.tsx  # Nedtelling-kort
│   ├── CountdownTimer.tsx # Nedtelling-timer
│   ├── HeroSection.tsx    # Hovedseksjon
│   ├── StorySection.tsx   # Historie-seksjon
│   ├── WeddingDetailsSection.tsx # Bryllupsdetaljer
│   ├── RSVPSection.tsx    # RSVP-seksjon
│   └── Footer.tsx         # Footer
├── types/                  # TypeScript type-definisjoner
│   └── index.ts           # Alle interfaces og typer
└── utils/                  # Hjelpefunksjoner
    └── dateUtils.ts       # Dato-relaterte funksjoner
```

## ♿ Tilgjengelighet

Nettsiden følger WCAG-standarder med:
- **Semantisk HTML** - Riktig bruk av `<section>`, `<article>`, `<header>`
- **ARIA-attributter** - `role`, `aria-label`, `aria-labelledby`
- **Fokus-håndtering** - Synlig fokus-indikator og tab-navigering
- **Skjermleser-støtte** - Alt-tekster og beskrivende labels

## 🔧 Komponenter

### DecorativeLine
Dekorativ gradient-linje som brukes som separator mellom seksjoner.

### CountdownCard
Individuelt kort som viser nedtelling til bryllupet med hover-effekter.

### CountdownTimer
Komplett nedtelling-komponent som bruker CountdownCard-komponentene.

### HeroSection
Hovedseksjon med bakgrunnsbilde, silhuett-overlay og nedtelling.

### StorySection
Seksjon som forteller historien om paret med animerte elementer.

### WeddingDetailsSection
Seksjon med bryllupsdetaljer i kort-format med ikoner.

### RSVPSection
RSVP-seksjon med interaktive knapper for deltakelse.

### Footer
Footer med kontaktinformasjon og copyright.

## 🎯 Funksjonalitet

- **Live nedtelling** til bryllupsdatoen
- **Responsivt design** for alle enheter
- **Hover-animasjoner** og smooth transitions
- **Glassmorphism-effekter** for moderne utseende
- **Gradient-bakgrunner** og skyggeeffekter

## 🚀 Kom i gang

1. **Installer avhengigheter:**
   ```bash
   npm install
   ```

2. **Start utviklingsserver:**
   ```bash
   npm run dev
   ```

3. **Åpne nettleseren:**
   ```
   http://localhost:3000
   ```

## 🧪 Testing

Kjør enhetstester:
```bash
npm test
```

## 🚀 Bygg og deploy

1. Bygg prosjektet:
```bash
npm run build
```
2. Start produksjonsserveren:
```bash
npm start
```
3. Deploy til ønsket plattform (f.eks. Vercel eller Netlify).

## 📱 Responsivitet

Nettsiden er fullt responsiv med:
- **Mobile-first** tilnærming
- **Adaptive bildevisning** basert på skjermstørrelse
- **Fleksible grid-layouts** som tilpasser seg alle enheter
- **Touch-vennlige** knapper og interaksjoner

## 🎨 Tilpasning

### Farger endre
Rediger CSS-variabler i `src/app/globals.css`:
```css
:root {
  --velvet: #2D1B3D;
  --pink: #E8B4B8;
  --apricot: #F4A261;
  /* ... */
}
```

### Bryllupsdetaljer endre
Oppdater `weddingDetails` objektet i `src/app/page.tsx`:
```typescript
const weddingDetails: WeddingDetails = {
  date: "Din dato",
  time: "Ditt klokkeslett",
  location: "Din lokasjon",
  // ...
};
```

## 🔮 Fremtidige forbedringer

- [ ] RSVP-funksjonalitet med backend-integrasjon
- [ ] Galleri med bryllupsbilder
- [ ] Gjesteliste-håndtering
- [ ] Push-notifikasjoner for nedtelling
- [ ] Offline-støtte med PWA
- [ ] Flerspråklig støtte

## 📄 Lisens

© 2026 Alexandra & Tobias - Laget med kjærlighet ❤️
