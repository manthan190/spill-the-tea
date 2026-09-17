import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const username = params.username?.toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (!username) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at')
    .eq('username', username)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}
