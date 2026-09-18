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
    const fakeEmail = `${cleanUsername}@spillthetea.app`;

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

    // Step 2: No profile row. Try to create an auth user.
    let authUserId: string | null = null;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: fakeEmail,
      email_confirm: true,
      user_metadata: { username: cleanUsername },
    });

    if (authError) {
      // The auth user already exists (profile row was never created or was deleted).
      // Look up the existing auth user by email so we can create the missing profile.
      if (authError.message?.includes('already been registered')) {
        const { data: usersList, error: listError } = await supabase.auth.admin.listUsers();

        if (listError || !usersList?.users) {
          return NextResponse.json(
            { error: 'Account exists but could not be resolved. Please try again.' },
            { status: 500 }
          );
        }

        const existingUser = usersList.users.find(
          (u) => u.email === fakeEmail
        );

        if (existingUser) {
          authUserId = existingUser.id;
        } else {
          // Edge case: email registered but not returned by listUsers (pagination).
          // Fall through to error.
          return NextResponse.json(
            { error: 'This handle is already taken. Try a different one.' },
            { status: 409 }
          );
        }
      } else {
        return NextResponse.json(
          { error: authError.message || 'Failed to create account' },
          { status: 500 }
        );
      }
    } else {
      authUserId = authData.user!.id;
    }

    if (!authUserId) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Step 3: Create the profile row (either brand new, or the missing one for an existing auth user)
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authUserId,
      username: cleanUsername,
      display_name: cleanUsername,
    });

    if (profileError) {
      // If the profile was created by a concurrent request, treat as success
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
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      userId: authUserId,
      username: cleanUsername,
      existing: false,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
