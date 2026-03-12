import { NextRequest, NextResponse } from 'next/server';
import { verifyCookie, logSecurityEvent, getClientIdentifier } from '@/lib/security';
import { supabaseServer } from '@/lib/supabase';

const BUCKET = 'story-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function isAuthenticated(request: NextRequest): boolean {
  const session = request.cookies.get('admin_session');
  if (!session?.value) return false;
  return verifyCookie(session.value) === 'authenticated';
}

// GET — list all images in the bucket
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 });
  }

  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      sortBy: { column: 'created_at', order: 'asc' },
    });

    if (error) {
      console.error('Error listing story images:', error);
      return NextResponse.json({ error: 'Kunne ikke hente bilder' }, { status: 500 });
    }

    const images = (data || [])
      .filter((f) => !f.name.startsWith('.'))
      .map((f) => {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
        return {
          name: f.name,
          url: urlData.publicUrl,
          createdAt: f.created_at,
        };
      });

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}

// POST — upload a new image
export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);

  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_image_upload', { clientId }, 'warning');
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Ingen fil valgt' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Ugyldig filtype. Tillatte typer: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Filen er for stor (maks 5 MB)' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const supabase = supabaseServer();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Kunne ikke laste opp bilde' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    logSecurityEvent('story_image_uploaded', { clientId, filename }, 'info');

    return NextResponse.json({
      url: urlData.publicUrl,
      name: filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Serverfeil ved opplasting' }, { status: 500 });
  }
}

// DELETE — remove an image
export async function DELETE(request: NextRequest) {
  const clientId = getClientIdentifier(request);

  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_image_delete', { clientId }, 'warning');
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Mangler filnavn' }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { error } = await supabase.storage.from(BUCKET).remove([name]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Kunne ikke slette bilde' }, { status: 500 });
    }

    logSecurityEvent('story_image_deleted', { clientId, name }, 'info');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Serverfeil ved sletting' }, { status: 500 });
  }
}
