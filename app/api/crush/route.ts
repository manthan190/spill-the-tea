import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { profileId } = await req.json();

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Get client IP
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    const supabase = getSupabaseServiceClient();

    // Insert crush entry (unique constraint prevents duplicates)
    const { error } = await supabase
      .from('crush_list')
      .insert({ profile_id: profileId, ip_address: ip });

    if (error) {
      // If duplicate, that's fine — they already added to crush list
      if (error.code === '23505') {
        // Still return the count
        const { count } = await supabase
          .from('crush_list')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId);

        return NextResponse.json({ count: count || 0, alreadyAdded: true });
      }
      return NextResponse.json({ error: 'Failed to add crush' }, { status: 500 });
    }

    // Get updated count
    const { count } = await supabase
      .from('crush_list')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    return NextResponse.json({ count: count || 0, alreadyAdded: false });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    // Count crushes from the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('crush_list')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .gte('created_at', weekAgo);

    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
