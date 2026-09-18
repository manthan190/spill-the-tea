import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { SendPageClient } from '@/components/send/send-page-client';
import type { Profile } from '@/types/database';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = {
  params: { username: string };
};

async function lookupProfile(username: string): Promise<Profile | null> {
  const supabase = getSupabaseServiceClient();

  // Exact match (username is stored lowercase)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('Profile lookup error:', error.message);
  }

  if (data) {
    return data as Profile;
  }

  // Fallback: case-insensitive match (handles edge cases where username
  // was stored with unexpected casing)
  const { data: ilikeData, error: ilikeError } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at')
    .ilike('username', username)
    .maybeSingle();

  if (ilikeError) {
    console.error('Profile ilike lookup error:', ilikeError.message);
  }

  return (ilikeData as Profile) || null;
}

export default async function SendPage({ params }: Props) {
  const rawUsername = params.username;
  const username = rawUsername?.toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (!username) {
    notFound();
  }

  const profile = await lookupProfile(username);

  if (!profile) {
    notFound();
  }

  return <SendPageClient profile={profile} />;
}

export async function generateMetadata({ params }: Props) {
  const username = params.username?.toLowerCase().replace(/[^a-z0-9_]/g, '') || '';
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'https://spillthetea.app';

  return {
    title: `Spill tea to @${username} — Spill The Tea`,
    description: `Send an anonymous message to @${username}. 100% anonymous. Zero logs.`,
    openGraph: {
      title: `Send @${username} a secret message ☕️`,
      description: `100% anonymous. Zero logs. Just tea.`,
      images: [{ url: `${baseUrl}/api/og?username=${username}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Send @${username} a secret message ☕️`,
      description: `100% anonymous. Zero logs. Just tea.`,
      images: [{ url: `${baseUrl}/api/og?username=${username}` }],
    },
  };
}
