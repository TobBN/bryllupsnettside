import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

interface PublicGuest {
  name: string;
}

interface PublicTable {
  table_number: number;
  capacity: number;
  guests: PublicGuest[];
  guest_count: number;
}

// GET: Fetch all tables with guests (public endpoint)
export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Fetch all tables with guests
    const { data: tables, error } = await supabase
      .from('seating_tables')
      .select(`
        table_number,
        capacity,
        seating_guests (
          name
        )
      `)
      .order('table_number', { ascending: true });

    if (error) {
      console.error('Error fetching seating tables:', error);
      return NextResponse.json(
        { error: 'Kunne ikke hente bord-data' },
        { status: 500 }
      );
    }

    const formattedTables: PublicTable[] = (tables || []).map((table: any) => ({
      table_number: table.table_number,
      capacity: table.capacity,
      guests: (table.seating_guests || []).map((g: { name: string }) => ({
        name: g.name,
      })),
      guest_count: (table.seating_guests || []).length,
    }));

    return NextResponse.json({
      success: true,
      data: formattedTables,
    });
  } catch (error) {
    console.error('Error fetching seating tables:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente bord-data' },
      { status: 500 }
    );
  }
}

