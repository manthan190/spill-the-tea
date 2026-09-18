import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string' || username.length < 2 || username.length > 20) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername !== username) {
      return NextResponse.json({ error: 'Invalid characters in username' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    // Step 1: Check if a profile already exists for this username
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({
        userId: existingProfile.id,
        username: existingProfile.username,
        existing: true,
      });
    }

    // Step 2: Insert a new profile. The id column defaults to gen_random_uuid().
    // The service role client bypasses RLS, so no auth context is needed.
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        username: cleanUsername,
        display_name: cleanUsername,
      })
      .select('id, username')
      .single();

    if (profileError) {
      console.error('Profile insert error:', profileError.code, profileError.message);

      // Unique violation — concurrent request created the profile
      if (profileError.code === '23505') {
        const { data: raceProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (raceProfile) {
          return NextResponse.json({
            userId: raceProfile.id,
            username: raceProfile.username,
            existing: true,
          });
        }
      }

      return NextResponse.json(
        { error: 'Could not create your profile. Please try a different handle.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      userId: newProfile.id,
      username: newProfile.username,
      existing: false,
    });
  } catch (err) {
    console.error('Profile creation unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
