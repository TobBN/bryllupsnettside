import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyCookie, logSecurityEvent, getClientIdentifier } from '@/lib/security';

interface RsvpGuest {
  name: string;
  allergies: string | null;
  guest_order: number;
}

interface RsvpWithGuests {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  response: 'yes' | 'no' | 'maybe';
  allergies: string | null;
  message: string | null;
  guest_count: number | null;
  created_at: string;
  updated_at: string;
  is_read: boolean | null;
  rsvp_guests: RsvpGuest[] | null;
}

// Helper to verify admin session
function isAuthenticated(request: NextRequest): boolean {
  const session = request.cookies.get('admin_session');
  
  if (!session?.value) {
    return false;
  }
  
  const verifiedValue = verifyCookie(session.value);
  return verifiedValue === 'authenticated';
}

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  // Check authentication
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_rsvp_list_access', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    // Fetch all RSVPs from Supabase with guests
    const supabase = supabaseServer();
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        rsvp_guests (
          name,
          allergies,
          guest_order
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RSVPs:', error);
      logSecurityEvent('rsvp_list_error', { clientId, error: error.message }, 'error');
      return NextResponse.json(
        { error: 'Kunne ikke hente RSVP-data' },
        { status: 500 }
      );
    }

    // Transform data for display - format response values and dates
    const formattedRsvps = (rsvps || []).map((rsvp: RsvpWithGuests) => {
      // Extract guests data
      const guests = (rsvp.rsvp_guests || []).sort((a: RsvpGuest, b: RsvpGuest) => 
        (a.guest_order || 0) - (b.guest_order || 0)
      );
      const names = guests.length > 0 
        ? guests.map((g: RsvpGuest) => g.name).filter(Boolean)
        : [rsvp.name || ''].filter(Boolean); // Fallback to rsvp.name for backward compatibility
      const allergies = guests.length > 0
        ? guests.map((g: RsvpGuest) => g.allergies || '').filter(Boolean)
        : [rsvp.allergies || ''].filter(Boolean); // Fallback to rsvp.allergies for backward compatibility

      return {
        id: rsvp.id,
        response: rsvp.response === 'yes' ? 'Ja' : rsvp.response === 'no' ? 'Nei' : 'Kanskje',
        responseRaw: rsvp.response, // Keep raw value for color coding
        names: names,
        phone: rsvp.phone || '-',
        allergies: allergies,
        guestCount: names.length || rsvp.guest_count || 1,
        createdAt: rsvp.created_at,
        is_read: rsvp.is_read || false,
        dateFormatted: rsvp.created_at 
          ? new Date(rsvp.created_at).toLocaleDateString('no-NO', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            })
          : '-',
        timeFormatted: rsvp.created_at 
          ? new Date(rsvp.created_at).toLocaleTimeString('no-NO', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          : '-',
      };
    });

    logSecurityEvent('rsvp_list_accessed', { clientId, count: formattedRsvps.length }, 'info');

    return NextResponse.json({
      success: true,
      data: formattedRsvps,
      count: formattedRsvps.length,
    });
  } catch (error) {
    console.error('Error fetching RSVP list:', error);
    logSecurityEvent('rsvp_list_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke hente RSVP-data' },
      { status: 500 }
    );
  }
}

