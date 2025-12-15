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

interface SeatingGuest {
  id: string;
  name: string;
  seat_number: number;
}

interface SeatingTable {
  id: string;
  table_number: number;
  capacity: number;
  created_at: string;
  updated_at: string;
  guests: SeatingGuest[];
}

// GET: Fetch all tables with guests
export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_seating_access', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const supabase = supabaseServer();
    
    // Fetch all tables with guests
    const { data: tables, error: tablesError } = await supabase
      .from('seating_tables')
      .select(`
        *,
        seating_guests (
          id,
          name,
          seat_number
        )
      `)
      .order('table_number', { ascending: true });

    if (tablesError) {
      console.error('Error fetching seating tables:', tablesError);
      logSecurityEvent('seating_fetch_error', { clientId, error: tablesError.message }, 'error');
      return NextResponse.json(
        { error: 'Kunne ikke hente bord-data' },
        { status: 500 }
      );
    }

    const formattedTables: SeatingTable[] = (tables || []).map((table: any) => ({
      id: table.id,
      table_number: table.table_number,
      capacity: table.capacity,
      created_at: table.created_at,
      updated_at: table.updated_at,
      guests: (table.seating_guests || []).sort((a: SeatingGuest, b: SeatingGuest) => 
        a.seat_number - b.seat_number
      ),
    }));

    return NextResponse.json({
      success: true,
      data: formattedTables,
    });
  } catch (error) {
    console.error('Error fetching seating tables:', error);
    logSecurityEvent('seating_fetch_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke hente bord-data' },
      { status: 500 }
    );
  }
}

// POST: Create new table
export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_seating_create', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const tableNumber = parseInt(String(body.table_number || ''), 10);
    const capacity = parseInt(String(body.capacity || 8), 10);

    if (!tableNumber || tableNumber < 1) {
      return NextResponse.json(
        { error: 'Bord-nummer må være et positivt tall' },
        { status: 400 }
      );
    }

    if (capacity < 1 || capacity > 8) {
      return NextResponse.json(
        { error: 'Kapasitet må være mellom 1 og 8' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('seating_tables')
      .insert({
        table_number: tableNumber,
        capacity: capacity,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating seating table:', error);
      logSecurityEvent('seating_create_error', { clientId, error: error.message, code: error.code }, 'error');
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Bord med dette nummeret eksisterer allerede' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Kunne ikke opprette bord' },
        { status: 500 }
      );
    }

    logSecurityEvent('seating_table_created', { clientId, tableNumber }, 'info');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating seating table:', error);
    logSecurityEvent('seating_create_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke opprette bord' },
      { status: 500 }
    );
  }
}

// PUT: Update table
export async function PUT(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_seating_update', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const id = body.id;
    const tableNumber = body.table_number ? parseInt(String(body.table_number), 10) : undefined;
    const capacity = body.capacity ? parseInt(String(body.capacity), 10) : undefined;

    if (!id) {
      return NextResponse.json(
        { error: 'Bord ID er påkrevd' },
        { status: 400 }
      );
    }

    const updateData: { table_number?: number; capacity?: number } = {};
    if (tableNumber !== undefined) {
      if (tableNumber < 1) {
        return NextResponse.json(
          { error: 'Bord-nummer må være et positivt tall' },
          { status: 400 }
        );
      }
      updateData.table_number = tableNumber;
    }
    if (capacity !== undefined) {
      if (capacity < 1 || capacity > 8) {
        return NextResponse.json(
          { error: 'Kapasitet må være mellom 1 og 8' },
          { status: 400 }
        );
      }
      updateData.capacity = capacity;
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('seating_tables')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating seating table:', error);
      logSecurityEvent('seating_update_error', { clientId, error: error.message, code: error.code }, 'error');
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Bord med dette nummeret eksisterer allerede' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Kunne ikke oppdatere bord' },
        { status: 500 }
      );
    }

    logSecurityEvent('seating_table_updated', { clientId, id }, 'info');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating seating table:', error);
    logSecurityEvent('seating_update_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere bord' },
      { status: 500 }
    );
  }
}

// DELETE: Delete table
export async function DELETE(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_seating_delete', { clientId }, 'warning');
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
        { error: 'Bord ID er påkrevd' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { error } = await supabase
      .from('seating_tables')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting seating table:', error);
      logSecurityEvent('seating_delete_error', { clientId, error: error.message }, 'error');
      return NextResponse.json(
        { error: 'Kunne ikke slette bord' },
        { status: 500 }
      );
    }

    logSecurityEvent('seating_table_deleted', { clientId, id }, 'info');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting seating table:', error);
    logSecurityEvent('seating_delete_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke slette bord' },
      { status: 500 }
    );
  }
}

