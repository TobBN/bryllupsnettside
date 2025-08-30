# 🎯 RSVP Backend Implementation Plan

## 📋 Oversikt

Dette dokumentet beskriver detaljert implementering av backend-system for RSVP-funksjonalitet, inkludert database, API, admin-panel og email-system.

---

## 🏗️ Arkitektur Oversikt

```mermaid
graph TD
    A[RSVP Form] --> B[API Route]
    B --> C[Validation]
    C --> D[Database]
    C --> E[Email Service]
    D --> F[Admin Dashboard]
    E --> G[Guest Email]
    F --> H[Export/Management]
```

---

## 🗄️ Database Design

### **Database Provider: Vercel Postgres**
**Begrunnelse:** Seamless integrasjon med Vercel, skalererbar, managed service

### **Database Schema**

```sql
-- RSVP hovedtabell
CREATE TABLE rsvps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  is_attending BOOLEAN NOT NULL,
  allergies TEXT,
  plus_one BOOLEAN DEFAULT FALSE,
  plus_one_name VARCHAR(255),
  dietary_restrictions TEXT,
  message TEXT,
  song_request VARCHAR(255),
  accommodation_needed BOOLEAN DEFAULT FALSE,
  transportation_needed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Admin brukere
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bryllupsinnstillinger
CREATE TABLE wedding_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES admin_users(id)
);

-- Email log for tracking
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  rsvp_id INTEGER REFERENCES rsvps(id),
  email_type VARCHAR(50) NOT NULL, -- 'confirmation', 'reminder', 'update'
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
  error_message TEXT
);

-- Eksempel data for wedding_settings
INSERT INTO wedding_settings (key, value, description) VALUES
('rsvp_deadline', '2026-06-01T23:59:59', 'RSVP svarfrist'),
('wedding_date', '2026-07-24T12:00:00', 'Bryllupsdato og tid'),
('wedding_location', 'Villa Paradiso, Oslo', 'Bryllupslokasjon'),
('max_guests', '150', 'Maksimalt antall gjester'),
('plus_one_allowed', 'true', 'Tillater plus one'),
('contact_email', 'alexandra.tobias@bryllup.no', 'Kontakt email'),
('contact_phone', '+47 123 45 678', 'Kontakt telefon');

-- Indekser for performance
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at);
CREATE INDEX idx_rsvps_is_attending ON rsvps(is_attending);
CREATE INDEX idx_rsvps_email ON rsvps(email);
CREATE INDEX idx_email_logs_rsvp_id ON email_logs(rsvp_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
```

---

## 🔧 API Implementation

### **1. Environment Setup**

```bash
# .env.local
POSTGRES_URL="postgresql://username:password@host:port/database"
POSTGRES_PRISMA_URL="postgresql://username:password@host:port/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://username:password@host:port/database"

# Email Service (Resend)
RESEND_API_KEY="re_xxxxxxxxx"
FROM_EMAIL="noreply@alexandraogtobias.no"
ADMIN_EMAIL="admin@alexandraogtobias.no"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
ADMIN_PASSWORD_HASH="$2b$12$hashed_password"

# Security
RATE_LIMIT_WINDOW="900000"  # 15 minutes in ms
RATE_LIMIT_MAX="10"         # Max requests per window
```

### **2. Dependencies**

```json
// package.json additions
{
  "dependencies": {
    "@vercel/postgres": "^0.5.0",
    "resend": "^2.0.0",
    "zod": "^3.22.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "@next/headers": "^15.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5"
  }
}
```

### **3. Type Definitions**

```typescript
// src/types/rsvp.ts
import { z } from 'zod';

// Zod schemas for validation
export const RSVPSchema = z.object({
  name: z.string()
    .min(2, "Navn må være minst 2 tegn")
    .max(100, "Navn kan ikke være mer enn 100 tegn")
    .regex(/^[a-zA-ZæøåÆØÅ\s'-]+$/, "Navn kan kun inneholde bokstaver, mellomrom og bindestrek"),
  
  email: z.string()
    .email("Ugyldig email-adresse")
    .optional()
    .or(z.literal("")),
  
  phone: z.string()
    .min(8, "Telefonnummer må være minst 8 siffer")
    .regex(/^[+]?[0-9\s\-\(\)]+$/, "Ugyldig telefonnummer format"),
  
  isAttending: z.boolean(),
  
  allergies: z.string()
    .max(500, "Allergier/kostholdspreferanser kan ikke være mer enn 500 tegn")
    .optional()
    .or(z.literal("")),
  
  plusOne: z.boolean().default(false),
  
  plusOneName: z.string()
    .max(100, "Navn på følge kan ikke være mer enn 100 tegn")
    .optional()
    .or(z.literal("")),
  
  dietaryRestrictions: z.string()
    .max(500, "Kostholdspreferanser kan ikke være mer enn 500 tegn")
    .optional()
    .or(z.literal("")),
  
  message: z.string()
    .max(1000, "Melding kan ikke være mer enn 1000 tegn")
    .optional()
    .or(z.literal("")),
  
  songRequest: z.string()
    .max(255, "Låtønske kan ikke være mer enn 255 tegn")
    .optional()
    .or(z.literal("")),
  
  accommodationNeeded: z.boolean().default(false),
  transportationNeeded: z.boolean().default(false)
});

export type RSVPFormData = z.infer<typeof RSVPSchema>;

export interface RSVPRecord extends RSVPFormData {
  id: number;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RSVPStats {
  totalResponses: number;
  attending: number;
  notAttending: number;
  pendingResponses: number;
  plusOnes: number;
  accommodationRequests: number;
  transportationRequests: number;
  lastResponseDate: string;
  responseRate: number; // percentage
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  lastLogin?: string;
  createdAt: string;
}

export interface WeddingSetting {
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
  updatedBy?: number;
}
```

### **4. Database Functions**

```typescript
// src/lib/database.ts
import { sql } from '@vercel/postgres';
import { RSVPFormData, RSVPRecord, RSVPStats } from '@/types/rsvp';

export async function saveRSVP(
  data: RSVPFormData, 
  ipAddress?: string, 
  userAgent?: string
): Promise<RSVPRecord> {
  const result = await sql`
    INSERT INTO rsvps (
      name, email, phone, is_attending, allergies, plus_one, plus_one_name,
      dietary_restrictions, message, song_request, accommodation_needed,
      transportation_needed, ip_address, user_agent
    )
    VALUES (
      ${data.name}, ${data.email || null}, ${data.phone}, ${data.isAttending},
      ${data.allergies || null}, ${data.plusOne}, ${data.plusOneName || null},
      ${data.dietaryRestrictions || null}, ${data.message || null}, 
      ${data.songRequest || null}, ${data.accommodationNeeded},
      ${data.transportationNeeded}, ${ipAddress || null}, ${userAgent || null}
    )
    RETURNING *
  `;
  
  return transformDBRecord(result.rows[0]);
}

export async function getAllRSVPs(): Promise<RSVPRecord[]> {
  const result = await sql`
    SELECT * FROM rsvps 
    ORDER BY created_at DESC
  `;
  
  return result.rows.map(transformDBRecord);
}

export async function getRSVPById(id: number): Promise<RSVPRecord | null> {
  const result = await sql`
    SELECT * FROM rsvps WHERE id = ${id}
  `;
  
  if (result.rows.length === 0) return null;
  return transformDBRecord(result.rows[0]);
}

export async function updateRSVP(id: number, data: Partial<RSVPFormData>): Promise<RSVPRecord> {
  const setClause = Object.keys(data)
    .map((key, index) => `${toSnakeCase(key)} = $${index + 2}`)
    .join(', ');
  
  const values = [id, ...Object.values(data)];
  
  const result = await sql`
    UPDATE rsvps 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  
  return transformDBRecord(result.rows[0]);
}

export async function deleteRSVP(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM rsvps WHERE id = ${id}
  `;
  
  return result.rowCount > 0;
}

export async function getRSVPStats(): Promise<RSVPStats> {
  const result = await sql`
    SELECT 
      COUNT(*) as total_responses,
      SUM(CASE WHEN is_attending THEN 1 ELSE 0 END) as attending,
      SUM(CASE WHEN NOT is_attending THEN 1 ELSE 0 END) as not_attending,
      SUM(CASE WHEN plus_one THEN 1 ELSE 0 END) as plus_ones,
      SUM(CASE WHEN accommodation_needed THEN 1 ELSE 0 END) as accommodation_requests,
      SUM(CASE WHEN transportation_needed THEN 1 ELSE 0 END) as transportation_requests,
      MAX(created_at) as last_response_date
    FROM rsvps
  `;
  
  const row = result.rows[0];
  const totalGuests = await getTotalExpectedGuests(); // From wedding settings
  
  return {
    totalResponses: parseInt(row.total_responses),
    attending: parseInt(row.attending),
    notAttending: parseInt(row.not_attending),
    pendingResponses: totalGuests - parseInt(row.total_responses),
    plusOnes: parseInt(row.plus_ones),
    accommodationRequests: parseInt(row.accommodation_requests),
    transportationRequests: parseInt(row.transportation_requests),
    lastResponseDate: row.last_response_date,
    responseRate: (parseInt(row.total_responses) / totalGuests) * 100
  };
}

export async function checkDuplicateRSVP(email: string, phone: string): Promise<RSVPRecord | null> {
  const result = await sql`
    SELECT * FROM rsvps 
    WHERE email = ${email} OR phone = ${phone}
    LIMIT 1
  `;
  
  if (result.rows.length === 0) return null;
  return transformDBRecord(result.rows[0]);
}

// Helper functions
function transformDBRecord(row: any): RSVPRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    isAttending: row.is_attending,
    allergies: row.allergies,
    plusOne: row.plus_one,
    plusOneName: row.plus_one_name,
    dietaryRestrictions: row.dietary_restrictions,
    message: row.message,
    songRequest: row.song_request,
    accommodationNeeded: row.accommodation_needed,
    transportationNeeded: row.transportation_needed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ipAddress: row.ip_address,
    userAgent: row.user_agent
  };
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

async function getTotalExpectedGuests(): Promise<number> {
  const result = await sql`
    SELECT value FROM wedding_settings WHERE key = 'max_guests'
  `;
  return parseInt(result.rows[0]?.value || '150');
}
```

### **5. Rate Limiting**

```typescript
// src/lib/rate-limit.ts
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 10
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  // Clean up expired entries
  if (store[key] && now > store[key].resetTime) {
    delete store[key];
  }
  
  // Initialize or increment
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    };
  } else {
    store[key].count++;
  }
  
  const remaining = Math.max(0, maxRequests - store[key].count);
  const success = store[key].count <= maxRequests;
  
  return {
    success,
    remaining,
    resetTime: store[key].resetTime
  };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}
```

### **6. Email Service**

```typescript
// src/lib/email.ts
import { Resend } from 'resend';
import { RSVPRecord } from '@/types/rsvp';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRSVPConfirmation(rsvp: RSVPRecord): Promise<boolean> {
  if (!rsvp.email) return true; // Skip if no email provided
  
  const subject = rsvp.isAttending 
    ? "✅ RSVP Bekreftet - Vi gleder oss til å se deg!"
    : "📝 RSVP Mottatt - Takk for svar";
  
  const htmlContent = rsvp.isAttending
    ? getAttendingEmailTemplate(rsvp)
    : getNotAttendingEmailTemplate(rsvp);
  
  try {
    const result = await resend.emails.send({
      from: `Alexandra & Tobias <${process.env.FROM_EMAIL}>`,
      to: [rsvp.email],
      subject,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': `rsvp-${rsvp.id}`
      }
    });
    
    // Log email sent
    await logEmail(rsvp.id, 'confirmation', rsvp.email, subject, 'sent');
    
    return true;
  } catch (error) {
    console.error('Failed to send RSVP confirmation:', error);
    await logEmail(rsvp.id, 'confirmation', rsvp.email, subject, 'failed', error.message);
    return false;
  }
}

export async function sendAdminNotification(rsvp: RSVPRecord): Promise<boolean> {
  const subject = `🎉 Ny RSVP fra ${rsvp.name}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2D1B3D;">Ny RSVP mottatt!</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Gjesteinformasjon:</h3>
        <p><strong>Navn:</strong> ${rsvp.name}</p>
        <p><strong>Email:</strong> ${rsvp.email || 'Ikke oppgitt'}</p>
        <p><strong>Telefon:</strong> ${rsvp.phone}</p>
        <p><strong>Deltar:</strong> ${rsvp.isAttending ? '✅ Ja' : '❌ Nei'}</p>
        
        ${rsvp.plusOne ? `<p><strong>Følge:</strong> ${rsvp.plusOneName || 'Ikke oppgitt navn'}</p>` : ''}
        ${rsvp.allergies ? `<p><strong>Allergier:</strong> ${rsvp.allergies}</p>` : ''}
        ${rsvp.message ? `<p><strong>Melding:</strong> ${rsvp.message}</p>` : ''}
        
        <p><strong>Registrert:</strong> ${new Date(rsvp.createdAt).toLocaleString('no-NO')}</p>
      </div>
      
      <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="background: #E8B4B8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Se i admin panel</a></p>
    </div>
  `;
  
  try {
    await resend.emails.send({
      from: `RSVP System <${process.env.FROM_EMAIL}>`,
      to: [process.env.ADMIN_EMAIL!],
      subject,
      html: htmlContent
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
}

function getAttendingEmailTemplate(rsvp: RSVPRecord): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FEFAE0 0%, #F4D1D4 100%); padding: 40px 20px;">
      <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2D1B3D; font-size: 32px; margin-bottom: 10px; font-family: 'Parisienne', cursive;">Alexandra & Tobias</h1>
          <div style="width: 100px; height: 2px; background: linear-gradient(90deg, #E8B4B8, #F4A261); margin: 0 auto;"></div>
        </div>
        
        <h2 style="color: #2D1B3D; text-align: center; margin-bottom: 20px;">Takk for din RSVP! 🎉</h2>
        
        <p style="color: #4A2B5A; line-height: 1.6; font-size: 16px;">Kjære ${rsvp.name},</p>
        
        <p style="color: #4A2B5A; line-height: 1.6; font-size: 16px;">
          Vi er så glade for at du kan komme på bryllupet vårt! Din RSVP er bekreftet, og vi gleder oss til å feire denne spesielle dagen sammen med deg.
        </p>
        
        <div style="background: #F8F9FA; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2D1B3D; margin-top: 0;">Dine opplysninger:</h3>
          <p style="margin: 5px 0; color: #4A2B5A;"><strong>Navn:</strong> ${rsvp.name}</p>
          ${rsvp.plusOne ? `<p style="margin: 5px 0; color: #4A2B5A;"><strong>Følge:</strong> ${rsvp.plusOneName || 'Navn ikke oppgitt'}</p>` : ''}
          ${rsvp.allergies ? `<p style="margin: 5px 0; color: #4A2B5A;"><strong>Allergier/Kosthold:</strong> ${rsvp.allergies}</p>` : ''}
          <p style="margin: 5px 0; color: #4A2B5A;"><strong>Registrert:</strong> ${new Date(rsvp.createdAt).toLocaleString('no-NO')}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #E8B4B8, #F4A261); padding: 20px; border-radius: 10px; margin: 25px 0; color: white;">
          <h3 style="margin-top: 0; color: white;">Bryllupsdetaljer:</h3>
          <p style="margin: 5px 0;"><strong>📅 Dato:</strong> Lørdag 24. juli 2026</p>
          <p style="margin: 5px 0;"><strong>🕐 Tid:</strong> Kl. 12:00</p>
          <p style="margin: 5px 0;"><strong>📍 Sted:</strong> Villa Paradiso, Oslo</p>
        </div>
        
        <p style="color: #4A2B5A; line-height: 1.6; font-size: 16px;">
          Mer informasjon om klesskode, transport og andre praktiske detaljer finner du på nettsiden vår.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: linear-gradient(135deg, #E8B4B8, #F4A261); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Besøk nettsiden</a>
        </div>
        
        <p style="color: #4A2B5A; line-height: 1.6; font-size: 16px; text-align: center;">
          Vi gleder oss til å se deg! ❤️<br>
          <em>Alexandra & Tobias</em>
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E8B4B8;">
          <p style="color: #999; font-size: 12px;">
            Har du spørsmål? Send oss en e-post på 
            <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #E8B4B8;">${process.env.ADMIN_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function getNotAttendingEmailTemplate(rsvp: RSVPRecord): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FEFAE0 0%, #F4D1D4 100%); padding: 40px 20px;">
      <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2D1B3D; font-size: 32px; margin-bottom: 10px; font-family: 'Parisienne', cursive;">Alexandra & Tobias</h1>
          <div style="width: 100px; height: 2px; background: linear-gradient(90deg, #E8B4B8, #F4A261); margin: 0 auto;"></div>
        </div>
        
        <h2 style="color: #2D1B3D; text-align: center; margin-bottom: 20px;">Takk for ditt svar 💕</h2>
        
        <p style="color: #4A2B5A; line-height: 1.6; font-size: 16px;">Kjære ${rsvp.name},</p>
        
        <p style="color: #4A2B5A; line-height: 1.6; font-size: 16px;">
          Takk for at du tok deg tid til å svare på invitasjonen vår. Vi forstår at du ikke kan komme på bryllupet vårt, og vi setter stor pris på at du ga oss beskjed.
        </p>
        
        ${rsvp.message ? `
        <div style="background: #F8F9FA; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2D1B3D; margin-top: 0;">Din melding til oss:</h3>
          <p style="color: #4A2B5A; font-style: italic;">"${rsvp.message}"</p>
        </div>
        ` : ''}
        
        <p style="color: #4A2B5A; line-height: 1.6; font-size: 16px;">
          Vi kommer til å savne deg på den store dagen, men vi håper vi kan feire sammen ved en annen anledning snart.
        </p>
        
        <p style="color: #4A2B5A; line-height: 1.6; font-size: 16px; text-align: center;">
          Vi ønsker deg alt godt! ❤️<br>
          <em>Alexandra & Tobias</em>
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E8B4B8;">
          <p style="color: #999; font-size: 12px;">
            Har du spørsmål? Send oss en e-post på 
            <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #E8B4B8;">${process.env.ADMIN_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

async function logEmail(
  rsvpId: number, 
  emailType: string, 
  recipientEmail: string, 
  subject: string, 
  status: string, 
  errorMessage?: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO email_logs (rsvp_id, email_type, recipient_email, subject, status, error_message)
      VALUES (${rsvpId}, ${emailType}, ${recipientEmail}, ${subject}, ${status}, ${errorMessage || null})
    `;
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}
```

---

## 🔌 API Routes Implementation

### **7. RSVP API Route**

```typescript
// app/api/rsvp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { RSVPSchema } from '@/types/rsvp';
import { 
  saveRSVP, 
  checkDuplicateRSVP 
} from '@/lib/database';
import { 
  sendRSVPConfirmation, 
  sendAdminNotification 
} from '@/lib/email';
import { 
  rateLimit, 
  getClientIdentifier 
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimit(clientId, 15 * 60 * 1000, 5); // 5 requests per 15 minutes
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'For mange forespørsler. Prøv igjen senere.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = RSVPSchema.parse(body);
    
    // Check for duplicate RSVP
    if (validatedData.email || validatedData.phone) {
      const existing = await checkDuplicateRSVP(
        validatedData.email || '', 
        validatedData.phone
      );
      
      if (existing) {
        return NextResponse.json({
          success: false,
          error: 'Det eksisterer allerede en RSVP med denne e-posten eller telefonnummeret. Kontakt oss hvis du ønsker å endre svaret ditt.',
          existingId: existing.id
        }, { status: 409 });
      }
    }
    
    // Get client info for logging
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0].trim() || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    // Save RSVP to database
    const savedRSVP = await saveRSVP(validatedData, ipAddress, userAgent);
    
    // Send confirmation email (async, don't wait)
    if (validatedData.email) {
      sendRSVPConfirmation(savedRSVP).catch(error => {
        console.error('Failed to send confirmation email:', error);
      });
    }
    
    // Send admin notification (async, don't wait)
    sendAdminNotification(savedRSVP).catch(error => {
      console.error('Failed to send admin notification:', error);
    });
    
    return NextResponse.json({
      success: true,
      message: validatedData.isAttending 
        ? 'Takk for din RSVP! Vi gleder oss til å se deg på bryllupet.' 
        : 'Takk for ditt svar. Vi forstår at du ikke kan komme.',
      rsvpId: savedRSVP.id,
      confirmationEmailSent: !!validatedData.email
    });
    
  } catch (error) {
    console.error('RSVP submission error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Ugyldig data sendt. Vennligst sjekk alle felt.',
        validationErrors: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'En feil oppstod ved lagring av RSVP. Vennligst prøv igjen.'
    }, { status: 500 });
  }
}

// GET method for admin to retrieve all RSVPs
export async function GET(request: NextRequest) {
  try {
    // Authentication check (implement JWT validation)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !isValidAdminToken(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const rsvps = await getAllRSVPs();
    
    return NextResponse.json({
      success: true,
      data: rsvps,
      count: rsvps.length
    });
    
  } catch (error) {
    console.error('Failed to fetch RSVPs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch RSVPs'
    }, { status: 500 });
  }
}

function isValidAdminToken(authHeader: string): boolean {
  // Implement JWT validation here
  // For now, return false - will be implemented with admin auth
  return false;
}
```

### **8. RSVP Statistics API**

```typescript
// app/api/rsvp/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRSVPStats } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !isValidAdminToken(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const stats = await getRSVPStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Failed to fetch RSVP stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics'
    }, { status: 500 });
  }
}

function isValidAdminToken(authHeader: string): boolean {
  // Implement JWT validation
  return false;
}
```

---

## 🖥️ Frontend Integration

### **9. Updated RSVPSection Component**

```typescript
// src/components/RSVPSection.tsx (Updated)
import { useState } from 'react';
import { RSVPSectionProps, RSVPFormData } from '@/types';
import { DecorativeLine } from './DecorativeLine';

export const RSVPSection: React.FC<RSVPSectionProps> = () => {
  const [formData, setFormData] = useState<Partial<RSVPFormData>>({
    name: '',
    email: '',
    phone: '',
    allergies: '',
    plusOneName: '',
    dietaryRestrictions: '',
    message: '',
    songRequest: '',
    plusOne: false,
    accommodationNeeded: false,
    transportationNeeded: false
  });
  
  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 2) {
      errors.name = 'Navn må være minst 2 tegn';
    }
    
    if (!formData.phone || formData.phone.length < 8) {
      errors.phone = 'Telefonnummer må være minst 8 siffer';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ugyldig e-postadresse';
    }
    
    if (formData.plusOne && !formData.plusOneName) {
      errors.plusOneName = 'Navn på følge er påkrevd';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ...formData,
          isAttending
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsSubmitted(true);
        setFormData({
          name: '', email: '', phone: '', allergies: '',
          plusOneName: '', dietaryRestrictions: '', message: '',
          songRequest: '', plusOne: false, accommodationNeeded: false,
          transportationNeeded: false
        });
        setIsAttending(null);
        setShowForm(false);
      } else {
        if (response.status === 429) {
          setSubmitError(`For mange forespørsler. Prøv igjen om ${result.retryAfter} sekunder.`);
        } else if (result.validationErrors) {
          const fieldErrors: Record<string, string> = {};
          result.validationErrors.forEach((error: any) => {
            fieldErrors[error.path[0]] = error.message;
          });
          setValidationErrors(fieldErrors);
        } else {
          setSubmitError(result.error || 'En feil oppstod ved sending av RSVP.');
        }
      }
    } catch (error) {
      console.error('RSVP submission error:', error);
      setSubmitError('Nettverksfeil. Sjekk internettforbindelsen og prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttendanceChoice = (attending: boolean) => {
    setIsAttending(attending);
    setShowForm(true);
    setSubmitError(null);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setIsAttending(null);
    setShowForm(false);
    setSubmitError(null);
    setValidationErrors({});
    setFormData({
      name: '', email: '', phone: '', allergies: '',
      plusOneName: '', dietaryRestrictions: '', message: '',
      songRequest: '', plusOne: false, accommodationNeeded: false,
      transportationNeeded: false
    });
  };

  return (
    <section id="rsvp" className="py-24 px-4 bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4] relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-pattern-romantic opacity-15"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <DecorativeLine className="mb-8" />
          <h2 
            id="rsvp-heading"
            className="text-4xl md:text-6xl lg:text-7xl leading-tight text-[#2D1B3D] mb-8"
          >
            RSVP
          </h2>
          <DecorativeLine className="mb-16" />
          
          <p className="font-body text-lg md:text-xl text-[#4A2B5A]/80 max-w-3xl mx-auto leading-relaxed">
            Vennligst svar om du kommer innen 1. juni 2026.
          </p>
          <p className="font-body text-lg md:text-xl text-[#4A2B5A]/80 max-w-3xl mx-auto leading-relaxed">
            Vi gleder oss til å feire sammen med dere!
          </p>
        </div>

        {!isSubmitted ? (
          <div className="max-w-2xl mx-auto">
            {!showForm ? (
              /* Attendance choice buttons */
              <div className="text-center space-y-8">
                <p className="font-body text-xl text-[#2D1B3D] mb-12">
                  Kan du komme på bryllupet vårt?
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button
                    onClick={() => handleAttendanceChoice(true)}
                    className="px-12 py-6 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body text-xl rounded-full hover-lift transition-all duration-300 transform hover:scale-105 shadow-xl"
                    aria-label="Ja, jeg kommer på bryllupet"
                  >
                    ✨ Ja, jeg kommer!
                  </button>
                  
                  <button
                    onClick={() => handleAttendanceChoice(false)}
                    className="px-12 py-6 bg-gradient-to-r from-[#4A2B5A] to-[#2D1B3D] text-white font-body text-xl rounded-full hover-lift transition-all duration-300 transform hover:scale-105 shadow-xl"
                    aria-label="Nei, jeg kan dessverre ikke komme"
                  >
                    😔 Kan dessverre ikke komme
                  </button>
                </div>
              </div>
            ) : (
              /* RSVP Form */
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
                <h3 className="text-2xl md:text-3xl text-[#2D1B3D] mb-8 text-center">
                  {isAttending ? '🎉 Flott! Vi gleder oss!' : '😔 Vi forstår at du ikke kan komme'}
                </h3>
                
                {submitError && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-700 font-body">{submitError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name field */}
                  <div>
                    <label htmlFor="name" className="block font-body text-[#2D1B3D] mb-2 text-lg">
                      Fullt navn *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl font-body text-lg focus:outline-none transition-colors ${
                        validationErrors.name 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-[#E8B4B8]/30 focus:border-[#E8B4B8]'
                      }`}
                      placeholder="Ditt fulle navn"
                    />
                    {validationErrors.name && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="block font-body text-[#2D1B3D] mb-2 text-lg">
                      E-postadresse (valgfritt)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl font-body text-lg focus:outline-none transition-colors ${
                        validationErrors.email 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-[#E8B4B8]/30 focus:border-[#E8B4B8]'
                      }`}
                      placeholder="din@email.no (for bekreftelse)"
                    />
                    {validationErrors.email && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  {/* Phone field */}
                  <div>
                    <label htmlFor="phone" className="block font-body text-[#2D1B3D] mb-2 text-lg">
                      Telefonnummer *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl font-body text-lg focus:outline-none transition-colors ${
                        validationErrors.phone 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-[#E8B4B8]/30 focus:border-[#E8B4B8]'
                      }`}
                      placeholder="+47 123 45 678"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  {isAttending && (
                    <>
                      {/* Plus one checkbox */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="plusOne"
                          name="plusOne"
                          checked={formData.plusOne || false}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#E8B4B8] rounded focus:ring-[#E8B4B8]"
                        />
                        <label htmlFor="plusOne" className="font-body text-[#2D1B3D] text-lg">
                          Jeg tar med følge
                        </label>
                      </div>

                      {/* Plus one name */}
                      {formData.plusOne && (
                        <div>
                          <label htmlFor="plusOneName" className="block font-body text-[#2D1B3D] mb-2 text-lg">
                            Navn på følge *
                          </label>
                          <input
                            type="text"
                            id="plusOneName"
                            name="plusOneName"
                            value={formData.plusOneName || ''}
                            onChange={handleInputChange}
                            required={formData.plusOne}
                            className={`w-full px-4 py-3 border-2 rounded-xl font-body text-lg focus:outline-none transition-colors ${
                              validationErrors.plusOneName 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-[#E8B4B8]/30 focus:border-[#E8B4B8]'
                            }`}
                            placeholder="Fullt navn på følge"
                          />
                          {validationErrors.plusOneName && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.plusOneName}</p>
                          )}
                        </div>
                      )}

                      {/* Allergies */}
                      <div>
                        <label htmlFor="allergies" className="block font-body text-[#2D1B3D] mb-2 text-lg">
                          Allergier og kostholdspreferanser
                        </label>
                        <textarea
                          id="allergies"
                          name="allergies"
                          value={formData.allergies || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-[#E8B4B8]/30 rounded-xl font-body text-lg focus:outline-none focus:border-[#E8B4B8] transition-colors resize-none"
                          placeholder="Beskriv allergier, intoleranser eller spesielle kostbehov..."
                        />
                      </div>

                      {/* Accommodation */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="accommodationNeeded"
                          name="accommodationNeeded"
                          checked={formData.accommodationNeeded || false}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#E8B4B8] rounded focus:ring-[#E8B4B8]"
                        />
                        <label htmlFor="accommodationNeeded" className="font-body text-[#2D1B3D] text-lg">
                          Jeg trenger hjelp med overnatting
                        </label>
                      </div>

                      {/* Transportation */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="transportationNeeded"
                          name="transportationNeeded"
                          checked={formData.transportationNeeded || false}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#E8B4B8] rounded focus:ring-[#E8B4B8]"
                        />
                        <label htmlFor="transportationNeeded" className="font-body text-[#2D1B3D] text-lg">
                          Jeg trenger hjelp med transport
                        </label>
                      </div>

                      {/* Song request */}
                      <div>
                        <label htmlFor="songRequest" className="block font-body text-[#2D1B3D] mb-2 text-lg">
                          Låtønske til festen
                        </label>
                        <input
                          type="text"
                          id="songRequest"
                          name="songRequest"
                          value={formData.songRequest || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-[#E8B4B8]/30 rounded-xl font-body text-lg focus:outline-none focus:border-[#E8B4B8] transition-colors"
                          placeholder="Hvilken låt vil du høre på festen?"
                        />
                      </div>
                    </>
                  )}

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block font-body text-[#2D1B3D] mb-2 text-lg">
                      Melding til oss (valgfritt)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-[#E8B4B8]/30 rounded-xl font-body text-lg focus:outline-none focus:border-[#E8B4B8] transition-colors resize-none"
                      placeholder="Send oss en hilsen eller andre kommentarer..."
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body text-xl rounded-xl hover-lift transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sender...
                        </span>
                      ) : (
                        '📤 Send RSVP'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-8 py-4 bg-gray-500 text-white font-body text-xl rounded-xl hover:bg-gray-600 transition-colors"
                    >
                      ← Tilbake
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Success message */
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-2xl md:text-3xl text-[#2D1B3D] mb-6">
                {isAttending ? 'RSVP mottatt!' : 'Takk for ditt svar!'}
              </h3>
              <p className="font-body text-lg text-[#4A2B5A] mb-8 leading-relaxed">
                {isAttending 
                  ? 'Vi gleder oss til å feire sammen med deg på den store dagen!'
                  : 'Vi forstår at du ikke kan komme, og setter pris på at du ga oss beskjed.'
                }
              </p>
              <button
                onClick={resetForm}
                className="px-8 py-3 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body text-lg rounded-xl hover-lift transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Send ny RSVP
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
```

---

## 🚀 Next Steps

### **Immediate Implementation (This week)**
1. **Setup Database** - Create Vercel Postgres instance
2. **Install Dependencies** - Add required packages
3. **Create Database Schema** - Run SQL setup script
4. **Implement API Routes** - Basic RSVP submission
5. **Update Frontend** - Enhanced RSVP form
6. **Test Integration** - End-to-end RSVP flow

### **Admin Dashboard (Next week)**
1. **Authentication System** - JWT-based admin login
2. **Admin Dashboard** - Statistics and guest management
3. **Data Export** - Excel/CSV export functionality
4. **Email Management** - Send updates to guests

### **Email System (Following week)**  
1. **Setup Resend** - Email service integration
2. **Email Templates** - Confirmation and notification emails
3. **Admin Notifications** - Real-time RSVP alerts
4. **Reminder System** - Automated reminder emails

Dette gir deg en komplett, production-ready RSVP backend med database, API, email og admin-funksjonalitet! 🎯
