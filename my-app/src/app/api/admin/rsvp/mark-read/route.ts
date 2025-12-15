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

// POST: Mark RSVP as read
export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_rsvp_mark_read', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const rsvpId = body.rsvp_id;
    const markAll = body.mark_all === true;

    if (!rsvpId && !markAll) {
      return NextResponse.json(
        { error: 'RSVP ID eller mark_all er påkrevd' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    
    if (markAll) {
      // Mark all RSVPs as read
      const { error } = await supabase
        .from('rsvps')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all RSVPs as read:', error);
        logSecurityEvent('rsvp_mark_all_read_error', { clientId, error: error.message }, 'error');
        return NextResponse.json(
          { error: 'Kunne ikke markere alle som lest' },
          { status: 500 }
        );
      }

      logSecurityEvent('rsvp_mark_all_read', { clientId }, 'info');
      return NextResponse.json({ success: true, message: 'Alle RSVP-svar er markert som lest' });
    } else {
      // Mark single RSVP as read
      const { error } = await supabase
        .from('rsvps')
        .update({ is_read: true })
        .eq('id', rsvpId);

      if (error) {
        console.error('Error marking RSVP as read:', error);
        logSecurityEvent('rsvp_mark_read_error', { clientId, error: error.message, rsvpId }, 'error');
        return NextResponse.json(
          { error: 'Kunne ikke markere RSVP som lest' },
          { status: 500 }
        );
      }

      logSecurityEvent('rsvp_mark_read', { clientId, rsvpId }, 'info');
      return NextResponse.json({ success: true, message: 'RSVP er markert som lest' });
    }
  } catch (error) {
    console.error('Error marking RSVP as read:', error);
    logSecurityEvent('rsvp_mark_read_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke markere RSVP som lest' },
      { status: 500 }
    );
  }
}

