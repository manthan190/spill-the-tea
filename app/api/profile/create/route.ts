import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = body?.username;

    if (!username || typeof username !== 'string' || username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Username must be 2-20 characters' },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername !== username) {
      return NextResponse.json(
        { success: false, error: 'Only lowercase letters, numbers, and underscores allowed' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Step 1: Check if a profile already exists for this username.
    // Try exact match first, then fall back to case-insensitive (ilike).
    let existingProfile: { id: string; username: string } | null = null;

    const { data: exactProfile, error: exactError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (exactError) {
      console.error('Supabase Execution Error:', JSON.stringify(exactError, null, 2));
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
            error: ilikeError.message || 'Database connection failed',
          },
          { status: 500 }
        );
      }

      existingProfile = ilikeProfile;
    } else {
      existingProfile = exactProfile;
    }

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        profile: {
          id: existingProfile.id,
          username: existingProfile.username,
        },
        existing: true,
      });
    }

    // Step 2: Insert a new profile with an explicitly generated UUID.
    const profileId = randomUUID();

    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: profileId,
        username: cleanUsername,
        display_name: cleanUsername,
      })
      .select('id, username')
      .single();

    if (profileError) {
      console.error('Supabase Execution Error:', JSON.stringify(profileError, null, 2));

      // Unique violation — concurrent request created the profile
      if (profileError.code === '23505') {
        const { data: raceProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (raceProfile) {
          return NextResponse.json({
            success: true,
            profile: {
              id: raceProfile.id,
              username: raceProfile.username,
            },
            existing: true,
          });
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: profileError.message || 'Database insert failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: newProfile.id,
        username: newProfile.username,
      },
      existing: false,
    });
  } catch (err) {
    console.error('Supabase Execution Error:', JSON.stringify(err, null, 2));
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
