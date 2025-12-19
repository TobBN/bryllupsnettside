# 📋 Comprehensive Documentation - Alexandra & Tobias Bryllupsnettside

## 🏗️ Code Review & Arkitektur Oversikt

### **🎯 Prosjektsammendrag**
En moderne, responsiv bryllupsnettside bygget med Next.js 15, TypeScript og Tailwind CSS. Nettsiden inkluderer nedtelling til bryllup, par-historie, RSVP-funksjonalitet og optimalisert for alle enheter, spesielt iOS Safari.

---

## 📊 Teknisk Stack

### **Frontend Framework**
- **Next.js 15.5.2** - React-basert fullstack framework med App Router
- **React 19.1.0** - Moderne React med hooks og concurrency features
- **TypeScript 5** - Type-sikkerhet og developer experience

### **Styling & UI**
- **Tailwind CSS 4** - Utility-first CSS framework
- **CSS Custom Properties** - For fargetema og design tokens
- **CSS Animations** - Smooth transitions og hover-effekter
- **Responsive Design** - Mobile-first tilnærming

### **Fonts & Typography**
- **Parisienne** - Elegant script font for overskrifter (via next/font/google)
- **Dancing Script** - Leselig script font for brødtekst
- **Playfair Display** - Serif fallback for display tekst
- **Cormorant Garamond** - Serif fallback for body tekst

### **Development Tools**
- **ESLint 9** - Code linting og kvalitetssikring
- **PostCSS** - CSS prosessering med Tailwind
- **TypeScript Compiler** - Type checking og transpilation

---

## 🏗️ Arkitektur & Mappestruktur

```
my-app/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📄 layout.tsx         # Root layout med fonts og metadata
│   │   ├── 📄 page.tsx           # Hovedside med state management
│   │   ├── 📄 globals.css        # Globale stiler og CSS variabler
│   │   └── 📄 favicon.ico        # Site ikon
│   │
│   ├── 📁 components/             # Modulære React komponenter
│   │   ├── 📄 index.ts           # Barrel exports
│   │   ├── 📄 HeroSection.tsx    # Hero med parallax og countdown
│   │   ├── 📄 StorySection.tsx   # Par-historie med timeline
│   │   ├── 📄 WeddingDetailsSection.tsx # Bryllupsdetaljer
│   │   ├── 📄 RSVPSection.tsx    # RSVP skjema (localStorage)
│   │   ├── 📄 Footer.tsx         # Footer med kontaktinfo
│   │   ├── 📄 CountdownTimer.tsx # Live countdown logikk
│   │   ├── 📄 CountdownCard.tsx  # Individuelt countdown kort
│   │   └── 📄 DecorativeLine.tsx # Dekorativ separator
│   │
│   ├── 📁 types/                  # TypeScript definisjoner
│   │   └── 📄 index.ts           # Alle interfaces og typer
│   │
│   └── 📁 utils/                  # Hjelpefunksjoner
│       ├── 📄 dateUtils.ts       # Countdown og dato-logikk
│       └── 📄 deviceUtils.ts     # Device detection for iOS/Safari
│
├── 📁 public/                     # Statiske assets
│   ├── 📄 couple-bg.jpg          # Hero bakgrunnsbilde
│   ├── 📄 romantic-silhouette.svg # Dekorativ silhuett
│   └── 📁 images/                # Galleri bilder
│       ├── 📄 story-1.jpg        # Timeline bilder
│       ├── 📄 story-2.jpg        
│       ├── 📄 story-3.jpg        
│       └── 📄 story-4.jpg        
│
├── 📄 package.json               # Dependencies og scripts
├── 📄 tsconfig.json              # TypeScript konfigurasjon
├── 📄 tailwind.config.ts         # Tailwind CSS konfigurasjon
├── 📄 next.config.ts             # Next.js konfigurasjon
└── 📄 README.md                  # Grunnleggende dokumentasjon
```

---

## 🧩 Komponent Analyse

### **1. 🦸 HeroSection.tsx**
**Ansvar:** Hovedvisning med bakgrunnsbilde, navn, og countdown
**Kompleksitet:** Høy
**Key Features:**
- iOS Safari parallax optimalisering
- Desktop fixed background attachment
- Device detection med `deviceUtils`
- Responsive countdown timer
- Accessibility optimalisert

**Critical Code Paths:**
- iOS parallax deaktivering for bedre UX
- Background positioning (`center 30%`) for optimal bildeutsnitt
- SSR-sikker device detection

### **2. 📖 StorySection.tsx**
**Ansvar:** Par-historie med bilder og timeline
**Kompleksitet:** Medium
**Key Features:**
- 4 optimaliserte bilder med hover-effekter
- Interaktiv timeline med animasjoner
- Modal bildevisning
- `object-position` optimalisering

**Data Management:**
```typescript
const timeline = [
  { date: "Våren 2016", title: "Vi møttes", text: "..." },
  // Lett å oppdatere innhold
];
```

### **3. 💬 RSVPSection.tsx**
**Ansvar:** RSVP skjema og deltakerstyring
**Kompleksitet:** Medium-Høy
**Current Implementation:**
- localStorage for midlertidig lagring
- Validering og error handling
- Animerte UI states (submitting, success)

**⚠️ CRITICAL IMPROVEMENT NEEDED:**
- Backend API integration
- Database persistent storage
- Admin panel for gjestestyring

### **4. 📋 WeddingDetailsSection.tsx**
**Ansvar:** Bryllupsdetaljer og praktisk informasjon
**Kompleksitet:** Medium
**Key Features:**
- Expandable detail boxes
- Ønskeliste-integrasjon
- Accessibility med ARIA

### **5. ⏰ CountdownTimer.tsx + CountdownCard.tsx**
**Ansvar:** Live countdown til bryllupsdato
**Kompleksiteit:** Lav-Medium
**Implementation:**
- Real-time updates hvert sekund
- Gradient animations
- Responsive design

---

## 🎨 Design System

### **Color Palette**
```css
:root {
  --velvet: #2D1B3D;          /* Primær mørk lilla */
  --velvet-light: #4A2B5A;    /* Lysere lilla variant */
  --pink: #E8B4B8;            /* Romantisk rosa */
  --pink-light: #F4D1D4;      /* Lys rosa variant */
  --apricot: #F4A261;         /* Varm oransje accent */
  --cream: #FEFAE0;           /* Lys beige bakgrunn */
}
```

### **Typography Hierarchy**
```css
/* Headings - Parisienne (Elegant script) */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-parisienne), cursive;
  font-weight: 400;
  letter-spacing: 0.01em;
}

/* Body Text - Dancing Script (Readable script) */
p, div, label, input, textarea, button {
  font-family: var(--font-dancing), cursive;
  font-size: 1.25rem; /* Accessibility optimized */
}
```

### **Responsive Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### **Animation Principles**
- **Duration**: 300ms standard, 1000ms for dramatic effects
- **Easing**: `ease-in-out` for natural feel
- **Performance**: Hardware acceleration med `transform3d()`

---

## 🔌 Current Data Flow

### **State Management**
```typescript
// Main page state
const [timeLeft, setTimeLeft] = useState<TimeLeft>({
  days: 0, hours: 0, minutes: 0, seconds: 0
});
const [isLoaded, setIsLoaded] = useState(true);

// RSVP local state
const [formData, setFormData] = useState({
  name: '', phone: '', allergies: ''
});
const [isAttending, setIsAttending] = useState<boolean | null>(null);
```

### **Data Persistence**
**Current:** Supabase PostgreSQL database
```typescript
// RSVP lagring i Supabase
// Data lagres i `rsvps` tabell med normalisert struktur:
// - rsvps: hovedtabell med telefonnummer og svar
// - rsvp_guests: separate gjester med navn og allergier per RSVP
```

**✅ IMPLEMENTED:** Persistent database, admin panel, Excel export, multi-guest support

---

## 🚨 Critical Issues & Technical Debt

### **1. RSVP Backend** ✅ **IMPLEMENTED**
- **Status:** Supabase database med normalisert struktur
- **Features:** Multi-guest support, admin panel, Excel export, read/unread status
- **API:** `/api/rsvp` (POST), `/api/admin/rsvp/list` (GET), `/api/admin/rsvp/export` (GET)

### **2. Admin Dashboard** ✅ **IMPLEMENTED**
- **Status:** Full admin panel på `/admin`
- **Features:** Content editing, RSVP management, seating chart management, program/schedule editing
- **Security:** Signed cookies, rate limiting, authentication required

### **3. Image Optimization**
- **Problem:** Statiske bilder uten optimalisering
- **Impact:** Slow loading, especially mobile
- **Solution Needed:** Next.js Image optimization implementering

### **4. SEO & Metadata**
- **Problem:** Minimal SEO optimalisering
- **Impact:** Dårlig søkemotorsynlighet
- **Solution Needed:** Structured data, OpenGraph, meta tags

### **5. Testing Coverage**
- **Problem:** Ingen automated testing
- **Impact:** Kan introdusere bugs i produksjon
- **Solution Needed:** Unit tests, E2E tests

---

## 🔮 Fremtidig Arkitektur - Roadmap

### **FASE 1: Backend Integration (Q1 2025)**

#### **1.1 Database Design**
```sql
-- RSVP Database Schema
CREATE TABLE rsvps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  is_attending BOOLEAN NOT NULL,
  allergies TEXT,
  plus_one BOOLEAN DEFAULT FALSE,
  plus_one_name VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wedding Settings
CREATE TABLE wedding_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **1.2 API Routes (Next.js 15)**
```typescript
// app/api/rsvp/route.ts
export async function POST(request: Request) {
  const data: RSVPData = await request.json();
  // Validate data
  // Save to database
  // Send confirmation email
  return Response.json({ success: true });
}

export async function GET() {
  // Admin endpoint - get all RSVPs
  return Response.json(rsvps);
}

// app/api/admin/dashboard/route.ts
export async function GET() {
  const stats = await getRSVPStats();
  return Response.json(stats);
}
```

#### **1.3 Enhanced RSVP Types**
```typescript
// Enhanced RSVP interface
export interface RSVPData {
  id?: number;
  name: string;
  email?: string;
  phone: string;
  isAttending: boolean;
  allergies: string;
  plusOne: boolean;
  plusOneName?: string;
  message?: string;
  timestamp: string;
  updatedAt?: string;
}

export interface RSVPStats {
  totalResponses: number;
  attending: number;
  notAttending: number;
  pendingResponses: number;
  lastResponseDate: string;
}
```

### **FASE 2: Admin Dashboard (Q1-Q2 2025)**

#### **2.1 Admin Components**
```typescript
// New admin components needed
- AdminDashboard.tsx     // Overview med stats
- RSVPManager.tsx        // Gjestestyring
- AttendeeList.tsx       // Liste over deltakere
- ExportData.tsx         // Excel/CSV export
- Settings.tsx           // Bryllupsinnstillinger
```

#### **2.2 Admin Routing**
```typescript
// app/admin/page.tsx - Protected admin routes
import { AdminDashboard } from '@/components/admin';

export default function AdminPage() {
  // Authentication check
  // Role-based access control
  return <AdminDashboard />;
}
```

### **FASE 3: Enhanced Features (Q2-Q3 2025)**

#### **3.1 Email System**
```typescript
// Email service integration
export interface EmailService {
  sendRSVPConfirmation(rsvp: RSVPData): Promise<boolean>;
  sendReminderEmails(attendees: RSVPData[]): Promise<boolean>;
  sendWeddingUpdates(message: string): Promise<boolean>;
}

// Using Resend, SendGrid, or similar
```

#### **3.2 Galleri Expansion**
```typescript
// Enhanced image management
export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: 'engagement' | 'couple' | 'family' | 'location';
  uploadDate: string;
  isVisible: boolean;
}
```

#### **3.3 Real-time Features**
```typescript
// WebSocket for live updates
export interface LiveFeatures {
  guestCounter: number;          // Live RSVP count
  weddingUpdates: string[];      // Real-time announcements  
  photoSharing: boolean;         // Guest photo uploads
}
```

### **FASE 4: Performance & SEO (Q3 2025)**

#### **4.1 Performance Optimizations**
- **Image Optimization:** Convert all images to WebP/AVIF
- **Code Splitting:** Dynamic imports for non-critical components
- **Caching Strategy:** ISR for dynamic content
- **Bundle Analysis:** Optimize JavaScript bundle size

#### **4.2 SEO Implementation**
```typescript
// Enhanced metadata
export const metadata: Metadata = {
  title: "Alexandra & Tobias - Bryllup 2026",
  description: "Velkommen til vårt bryllup...",
  openGraph: {
    title: "Alexandra & Tobias - Bryllup 2026",
    description: "Vi gifter oss 24. juli 2026...",
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Alexandra & Tobias - Bryllup 2026",
    description: "Vi gifter oss 24. juli 2026...",
    images: ['/twitter-image.jpg'],
  },
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Alexandra & Tobias Bryllup",
    "startDate": "2026-07-24",
    "location": {
      "@type": "Place",
      "name": "Villa Paradiso",
      "address": "Oslo, Norge"
    }
  }
};
```

---

## 🛠️ Development Setup & Scripts

### **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "next dev",                    // Development server
    "build": "next build",               // Production build
    "start": "next start",               // Production server
    "lint": "eslint src/",               // Code linting
    "lint:fix": "eslint src/ --fix",     // Auto-fix linting
    "type-check": "tsc --noEmit",        // TypeScript validation
    "test": "jest",                      // Unit testing (future)
    "test:e2e": "playwright test"        // E2E testing (future)
  }
}
```

### **Development Workflow**
1. **Local Development:** `npm run dev`
2. **Code Quality:** `npm run lint && npm run type-check`
3. **Build Validation:** `npm run build`
4. **Git Workflow:** 
   ```bash
   git add .
   git commit -m "feat: describe change"
   git push origin main
   ```
5. **Auto Deployment:** Vercel triggers on push to main

---

## 🔒 Security Considerations

### **Current Security State**
- ✅ **HTTPS Enforced** via Vercel
- ✅ **Supabase Database** with Row Level Security (RLS) enabled
- ✅ **Admin Authentication** with signed cookies and session management
- ✅ **Input Validation** on all API endpoints
- ✅ **Rate Limiting** implemented (5 requests per 15 minutes for RSVP, 5 per 15 minutes for admin login)
- ✅ **Security Headers** (CSP, X-Frame-Options, Referrer-Policy, etc.)
- ✅ **Security Event Logging** for monitoring and audit trails
- ✅ **OWASP Top 10** compliance verified

### **Future Security Requirements**
```typescript
// Input validation with Zod
import { z } from 'zod';

const RSVPSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[+]?[0-9\s\-\(\)]+$/),
  allergies: z.string().max(500),
  isAttending: z.boolean()
});

// Rate limiting
export const rateLimit = {
  rsvp: '5 requests per minute',
  admin: '100 requests per minute'
};
```

---

## 📊 Performance Metrics

### **Current Performance (Lighthouse)**
- **Performance:** ~85 (Mobile), ~95 (Desktop)
- **Accessibility:** ~90
- **Best Practices:** ~95
- **SEO:** ~80

### **Performance Goals**
- **Performance:** 95+ (Both mobile/desktop)
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 95+

### **Key Optimizations Needed**
1. **Image formats:** WebP/AVIF conversion
2. **Font loading:** Preload critical fonts
3. **JavaScript:** Code splitting for non-critical features
4. **CSS:** Critical CSS inlining

---

## 🚀 Deployment & Infrastructure

### **Current Deployment**
- **Platform:** Vercel
- **Domain:** alexandraogtobias.no (via One.com DNS)
- **SSL:** Automatic via Vercel
- **CDN:** Global edge network
- **Build Time:** ~2-3 minutes

### **Future Infrastructure Needs**
```typescript
// Database options
interface DatabaseOptions {
  development: 'PostgreSQL local' | 'SQLite';
  production: 'Vercel Postgres' | 'Supabase' | 'PlanetScale';
}

// Email service options
interface EmailOptions {
  transactional: 'Resend' | 'SendGrid' | 'Postmark';
  marketing: 'Mailchimp' | 'ConvertKit';
}

// File storage (for photos)
interface StorageOptions {
  images: 'Vercel Blob' | 'Cloudinary' | 'AWS S3';
}
```

---

## 🎯 Implementation Priority

### **🔥 HIGH PRIORITY (Q1 2025)**
1. **Backend API for RSVP** - PostgreSQL + API routes
2. **Admin Dashboard** - Basic gjestestyring
3. **Email Confirmations** - RSVP bekreftelser
4. **Data Export** - Excel/CSV for gjestelist

### **⚡ MEDIUM PRIORITY (Q2 2025)**
1. **Enhanced Validation** - Zod schema validation
2. **Photo Gallery** - Expanded image system
3. **Real-time Updates** - Live RSVP counter
4. **Mobile PWA** - Offline capabilities

### **📈 LOW PRIORITY (Q3 2025)**
1. **Advanced Analytics** - Visitor tracking
2. **Social Integration** - Instagram feed
3. **Multi-language** - English/Norwegian
4. **Wedding Planning Tools** - Integrated checklist

---

## 📝 Implementation Guide - RSVP Backend

### **Step 1: Database Setup**
```bash
# Install dependencies
npm install @vercel/postgres zod bcryptjs jsonwebtoken

# Environment variables needed
POSTGRES_URL="postgresql://..."
JWT_SECRET="your-secret-key"
ADMIN_PASSWORD_HASH="bcrypt-hash"
```

### **Step 2: API Routes**
```typescript
// app/api/rsvp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RSVPSchema } from '@/lib/validation';
import { saveRSVP } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validData = RSVPSchema.parse(body);
    
    const rsvp = await saveRSVP(validData);
    
    // Send confirmation email
    await sendRSVPConfirmation(rsvp);
    
    return NextResponse.json({ 
      success: true, 
      message: 'RSVP mottatt!' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Feil ved lagring av RSVP' 
    }, { status: 400 });
  }
}
```

### **Step 3: Database Functions**
```typescript
// lib/database.ts
import { sql } from '@vercel/postgres';
import { RSVPData } from '@/types';

export async function saveRSVP(data: RSVPData) {
  const result = await sql`
    INSERT INTO rsvps (name, email, phone, is_attending, allergies, message)
    VALUES (${data.name}, ${data.email}, ${data.phone}, ${data.isAttending}, ${data.allergies}, ${data.message})
    RETURNING *
  `;
  
  return result.rows[0];
}

export async function getAllRSVPs() {
  const result = await sql`
    SELECT * FROM rsvps ORDER BY created_at DESC
  `;
  
  return result.rows;
}
```

### **Step 4: Update RSVPSection Component**
```typescript
// Erstatt localStorage logikk med API call
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        isAttending,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      setIsSubmitted(true);
      setFormData({ name: '', phone: '', allergies: '' });
      setIsAttending(null);
      setShowForm(false);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    alert('Feil ved sending av RSVP. Prøv igjen.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🎯 Konklusjon

Dette prosjektet er en solid foundation for en moderne bryllupsnettside med god arkitektur og kodemkvalitet. De viktigste forbedringene som trengs er:

1. **Backend-integrasjon** for RSVP-håndtering
2. **Admin dashboard** for gjestestyring  
3. **Email-system** for kommunikasjon
4. **Performance-optimalisering** for bilder og lading

Med disse implementert vil nettsiden være production-ready for et profesjonelt bryllup med full gjestestyring og admin-funksjonalitet.
