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

    // Check if username is already taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existing) {
      // Return existing profile — let user reuse it
      return NextResponse.json({
        userId: existing.id,
        username: existing.username,
        existing: true,
      });
    }

    // Create a new auth user with a random email (anonymous account)
    const fakeEmail = `${cleanUsername}@spillthetea.app`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: fakeEmail,
      email_confirm: true,
      user_metadata: { username: cleanUsername },
    });

    if (authError || !authData.user) {
      // If user already exists in auth, try to find their profile
      if (authError?.message?.includes('already been registered')) {
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
      }
      return NextResponse.json(
        { error: authError?.message || 'Failed to create account' },
        { status: 500 }
      );
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username: cleanUsername,
      display_name: cleanUsername,
    });

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      userId: authData.user.id,
      username: cleanUsername,
      existing: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
