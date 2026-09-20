import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username');

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { success: false, available: false, error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (cleanUsername.length < 2 || cleanUsername.length > 20) {
      return NextResponse.json(
        { success: false, available: false, error: 'Username must be 2-20 characters' },
        { status: 400 }
      );
    }

    if (cleanUsername !== username) {
      return NextResponse.json(
        { success: false, available: false, error: 'Only lowercase letters, numbers, and underscores allowed' },
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
      console.error('Supabase Execution Error:', JSON.stringify(error, null, 2));
      // Fallback to case-insensitive query
      const { data: ilikeProfile, error: ilikeError } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (ilikeError) {
        console.error('Supabase Execution Error:', JSON.stringify(ilikeError, null, 2));
        return NextResponse.json(
          {
            success: false,
            available: false,
            error: ilikeError.message || 'Database connection failed',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, available: !ilikeProfile });
    }

    return NextResponse.json({ success: true, available: !profile });
  } catch (err) {
    console.error('Supabase Execution Error:', JSON.stringify(err, null, 2));
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { success: false, available: false, error: message },
      { status: 500 }
    );
  }
}
