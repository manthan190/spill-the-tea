import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username');

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { available: false, error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (cleanUsername.length < 2 || cleanUsername.length > 20) {
      return NextResponse.json(
        { available: false, error: 'Username must be 2-20 characters' },
        { status: 400 }
      );
    }

    if (cleanUsername !== username) {
      return NextResponse.json(
        { available: false, error: 'Only lowercase letters, numbers, and underscores allowed' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Exact match first
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (error) {
      console.error('Username check DB error (exact):', error.message, error.code);
      // Fallback to case-insensitive query
      const { data: ilikeProfile, error: ilikeError } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (ilikeError) {
        console.error('Username check DB error (ilike):', ilikeError.message, ilikeError.code);
        return NextResponse.json(
          { available: false, error: 'Could not check username availability. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ available: !ilikeProfile });
    }

    return NextResponse.json({ available: !profile });
  } catch (err) {
    console.error('Username check unexpected error:', err);
    return NextResponse.json(
      { available: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
