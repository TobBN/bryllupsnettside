import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const CONTENT_FILE_PATH = join(process.cwd(), 'data', 'content.json');

// Helper to verify admin session
function isAuthenticated(request: NextRequest): boolean {
  const session = request.cookies.get('admin_session');
  return session?.value === 'authenticated';
}

export async function GET() {
  try {
    const content = readFileSync(CONTENT_FILE_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Error reading content:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lese innhold' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate that body is an object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Ugyldig dataformat' },
        { status: 400 }
      );
    }

    // Ensure directory exists
    const contentDir = dirname(CONTENT_FILE_PATH);
    if (!existsSync(contentDir)) {
      mkdirSync(contentDir, { recursive: true });
    }

    // Write to file
    writeFileSync(CONTENT_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing content:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lagre innhold' },
      { status: 500 }
    );
  }
}

