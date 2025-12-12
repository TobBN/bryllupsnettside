-- Migration: Create content table for admin panel
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS website_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Insert initial content from existing content.json structure
INSERT INTO website_content (id, content)
VALUES ('main', '{
  "hero": {
    "date": "24. juli 2026",
    "location": "Østgaard, Halden",
    "names": {
      "bride": "Alexandra",
      "groom": "Tobias"
    }
  },
  "story": {
    "title": "Vår historie",
    "subtitle": "Et lite tilbakeblikk på vår reise sammen",
    "timeline": [
      {
        "date": "Våren 2016",
        "title": "Vi møttes",
        "text": "En solfull dag i Son – en gåtur, en nedlagt jernbanelinje langs sjøen, og en klem som ble starten på alt."
      },
      {
        "date": "Sommeren 2018",
        "title": "Vår nye hverdag",
        "text": "Midnattsol og mørketid, familieliv og små eventyr som gjorde oss til verdens beste team."
      },
      {
        "date": "September 2018",
        "title": "Familien øker",
        "text": "Leah, vårt første barn, kommer til verden og sammen er vi nå tre."
      },
      {
        "date": "Oktober 2019",
        "title": "Familien øker igjen",
        "text": "Lucas kommer som nummer to, lykken er stor og søvnmangelen merkes."
      },
      {
        "date": "Mars 2021",
        "title": "Familien øker enda en gang",
        "text": "Live ankommer familien som en virvelvind, vi er nå fem i huset."
      },
      {
        "date": "Oktober 2022",
        "title": "Forlovelsen",
        "text": "Et «ja» på bursdagen til Alexandra, med barna rundt oss, og utsikt over vannet og fremtiden."
      },
      {
        "date": "Juli 2024",
        "title": "Hjemkomsten",
        "text": "Vi flytter tilbake til Sør-Norge, og begynner å bygge vårt nye liv her."
      },
      {
        "date": "Sommeren 2026",
        "title": "Bryllup",
        "text": "Vi gleder oss til å feire kjærligheten sammen med dere alle."
      }
    ]
  },
  "weddingDetails": {
    "title": "Selve dagen",
    "venue": {
      "title": "Sted",
      "description": "Vielse og fest på Garder Østgaard i Halden",
      "website": "https://www.garder-ostgaard.no",
      "websiteLabel": "www.garder-ostgaard.no",
      "address": "Brødenveien 31, 1763 Halden",
      "mapsLink": "https://maps.google.com/?q=Brødenveien+31,+1763+Halden"
    },
    "dressCode": {
      "title": "Antrekk",
      "general": "Mørk dress / sommerformell",
      "men": {
        "title": "Herrer:",
        "description": "Mørk dress, slips eller sløyfe, skjorte som tåler juli-varme. Lys sommerdress er lov hvis sola koker."
      },
      "women": {
        "title": "Damer:",
        "description": "Cocktailkjole, lang kjole eller en elegant sommerkjole – gjerne lett og sommerlig, men fortsatt pyntet."
      },
      "note": "Poenget: Pent, sommerlig og høytidelig. Kle deg så du ser bra ut på bilder, men fortsatt kan spise, drikke og danse hele kvelden."
    },
    "gifts": {
      "title": "Gaveønsker",
      "description": "Vi blir både glade for gaver fra ønskelisten og pengebidrag til vår bryllupsreise",
      "links": [
        {
          "url": "https://www.onsk.no",
          "label": "🎁 Ønskeliste fra Onsk.no"
        },
        {
          "url": "https://www.vinmonopolet.no",
          "label": "🍷 Vin fra Vinmonopolet"
        },
        {
          "url": "https://stas.app",
          "label": "🏠 Alternativ 3 (stas.app)"
        }
      ],
      "vipps": "💰 Vipps: til bryllupsreise"
    },
    "food": {
      "title": "Mat",
      "description": "Meny kommer...",
      "allergyNote": "* Allergier meldes fra om i RSVP"
    }
  },
  "footer": {
    "heading": "Alexandra & Tobias",
    "tagline": "Vi gleder oss til å dele denne spesielle dagen med dere 👩‍❤️‍💋‍👨",
    "contact": {
      "title": "Kontakt",
      "bride": {
        "name": "Alexandra",
        "phone": "+47 950 20 606"
      },
      "groom": {
        "name": "Tobias",
        "phone": "+47 905 95 348"
      }
    }
  }
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_website_content_id ON website_content(id);

