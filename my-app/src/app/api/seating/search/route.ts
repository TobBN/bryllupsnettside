import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// GET: Search for guest by name (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Søkestreng må være minst 2 tegn' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    
    // Search for guest by name (case-insensitive)
    const { data: guests, error } = await supabase
      .from('seating_guests')
      .select(`
        id,
        name,
        seat_number,
        table_id,
        seating_tables (
          table_number,
          capacity
        )
      `)
      .ilike('name', `%${query}%`);

    if (error) {
      console.error('Error searching seating guests:', error);
      return NextResponse.json(
        { error: 'Kunne ikke søke etter gjest' },
        { status: 500 }
      );
    }

    if (!guests || guests.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        data: null,
      });
    }

    // Get all guests on the same table for the first match
    const firstMatch = guests[0];
    const tableId = firstMatch.table_id;

    const { data: tableGuests, error: tableGuestsError } = await supabase
      .from('seating_guests')
      .select('name, seat_number')
      .eq('table_id', tableId)
      .order('seat_number', { ascending: true });

    if (tableGuestsError) {
      console.error('Error fetching table guests:', tableGuestsError);
    }

    const table = firstMatch.seating_tables as { table_number: number; capacity: number } | null;

    return NextResponse.json({
      success: true,
      found: true,
      data: {
        table_number: table?.table_number || 0,
        seat_number: firstMatch.seat_number,
        name: firstMatch.name,
        table_guests: (tableGuests || []).map((g: { name: string; seat_number: number }) => ({
          name: g.name,
          seat_number: g.seat_number,
        })),
      },
    });
  } catch (error) {
    console.error('Error searching seating guests:', error);
    return NextResponse.json(
      { error: 'Kunne ikke søke etter gjest' },
      { status: 500 }
    );
  }
}

