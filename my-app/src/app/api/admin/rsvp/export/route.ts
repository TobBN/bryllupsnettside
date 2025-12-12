import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyCookie, logSecurityEvent, getClientIdentifier } from '@/lib/security';
import * as XLSX from 'xlsx';

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
    logSecurityEvent('unauthorized_rsvp_export', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    // Fetch all RSVPs from Supabase
    const supabase = supabaseServer();
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RSVPs:', error);
      logSecurityEvent('rsvp_export_error', { clientId, error: error.message }, 'error');
      return NextResponse.json(
        { error: 'Kunne ikke hente RSVP-data' },
        { status: 500 }
      );
    }

    // Transform data for Excel - only include fields that are actually used in the form
    const excelData = (rsvps || []).map((rsvp) => ({
      'Kommer?': rsvp.response === 'yes' ? 'Ja' : rsvp.response === 'no' ? 'Nei' : 'Kanskje',
      Navn: rsvp.name || '',
      Telefon: rsvp.phone || '-',
      Allergier: rsvp.allergies || '-',
      Dato: rsvp.created_at ? new Date(rsvp.created_at).toLocaleDateString('no-NO') : '-',
      Tid: rsvp.created_at ? new Date(rsvp.created_at).toLocaleTimeString('no-NO') : '-',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Kommer?
      { wch: 25 }, // Navn
      { wch: 15 }, // Telefon
      { wch: 30 }, // Allergier
      { wch: 12 }, // Dato
      { wch: 10 }, // Tid
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RSVP Svar');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `rsvp-svar-${dateStr}.xlsx`;

    logSecurityEvent('rsvp_exported', { clientId, count: excelData.length }, 'info');

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting RSVPs:', error);
    logSecurityEvent('rsvp_export_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Kunne ikke eksportere RSVP-data' },
      { status: 500 }
    );
  }
}

