import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  const username = params.username?.toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (!username) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  // Exact match first
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at')
    .eq('username', username)
    .maybeSingle();

  if (profile) {
    return NextResponse.json(profile);
  }

  // Fallback: case-insensitive match
  if (error) {
    console.error('Profile API lookup error:', error.message);
  }

  const { data: ilikeProfile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at')
    .ilike('username', username)
    .maybeSingle();

  if (ilikeProfile) {
    return NextResponse.json(ilikeProfile);
  }

  return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
}
