import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyCookie, logSecurityEvent, getClientIdentifier } from '@/lib/security';

// Helper to verify admin session
function isAuthenticated(request: NextRequest): boolean {
  const session = request.cookies.get('admin_session');
  
  if (!session?.value) {
    return false;
  }
  
  const verifiedValue = verifyCookie(session.value);
  return verifiedValue === 'authenticated';
}

// POST: Add guest to table
export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_seating_guest_create', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const tableId = body.table_id;
    const name = (body.name || '').toString().trim();
    const seatNumber = parseInt(String(body.seat_number || ''), 10);

    if (!tableId) {
      return NextResponse.json(
        { error: 'Bord ID er påkrevd' },
        { status: 400 }
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Navn må være minst 2 tegn' },
        { status: 400 }
      );
    }

    if (!seatNumber || seatNumber < 1 || seatNumber > 8) {
      return NextResponse.json(
        { error: 'Plass-nummer må være mellom 1 og 8' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('seating_guests')
      .insert({
        table_id: tableId,
        name: name,
        seat_number: seatNumber,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding seating guest:', error);
      logSecurityEvent('seating_guest_create_error', { clientId, error: error.message, code: error.code }, 'error');
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Denne plassen er allerede opptatt på dette bordet' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Kunne ikke legge til gjest' },
        { status: 500 }
      );
    }

    logSecurityEvent('seating_guest_created', { clientId, tableId, name }, 'info');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error adding seating guest:', error);
    logSecurityEvent('seating_guest_create_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke legge til gjest' },
      { status: 500 }
    );
  }
}

// PUT: Update guest (move to different table/seat)
export async function PUT(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_seating_guest_update', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const id = body.id;
    const tableId = body.table_id;
    const name = body.name ? (body.name).toString().trim() : undefined;
    const seatNumber = body.seat_number ? parseInt(String(body.seat_number), 10) : undefined;

    if (!id) {
      return NextResponse.json(
        { error: 'Gjest ID er påkrevd' },
        { status: 400 }
      );
    }

    const updateData: { table_id?: string; name?: string; seat_number?: number } = {};
    if (tableId) updateData.table_id = tableId;
    if (name !== undefined) {
      if (name.length < 2) {
        return NextResponse.json(
          { error: 'Navn må være minst 2 tegn' },
          { status: 400 }
        );
      }
      updateData.name = name;
    }
    if (seatNumber !== undefined) {
      if (seatNumber < 1 || seatNumber > 8) {
        return NextResponse.json(
          { error: 'Plass-nummer må være mellom 1 og 8' },
          { status: 400 }
        );
      }
      updateData.seat_number = seatNumber;
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('seating_guests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating seating guest:', error);
      logSecurityEvent('seating_guest_update_error', { clientId, error: error.message, code: error.code }, 'error');
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Denne plassen er allerede opptatt på dette bordet' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Kunne ikke oppdatere gjest' },
        { status: 500 }
      );
    }

    logSecurityEvent('seating_guest_updated', { clientId, id }, 'info');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating seating guest:', error);
    logSecurityEvent('seating_guest_update_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere gjest' },
      { status: 500 }
    );
  }
}

// DELETE: Remove guest from table
export async function DELETE(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_seating_guest_delete', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Gjest ID er påkrevd' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { error } = await supabase
      .from('seating_guests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting seating guest:', error);
      logSecurityEvent('seating_guest_delete_error', { clientId, error: error.message }, 'error');
      return NextResponse.json(
        { error: 'Kunne ikke fjerne gjest' },
        { status: 500 }
      );
    }

    logSecurityEvent('seating_guest_deleted', { clientId, id }, 'info');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting seating guest:', error);
    logSecurityEvent('seating_guest_delete_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke fjerne gjest' },
      { status: 500 }
    );
  }
}

