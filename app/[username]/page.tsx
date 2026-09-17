import { getSupabaseServerClient } from '@/lib/supabase/server';
import { SendPageClient } from '@/components/send/send-page-client';
import type { Profile } from '@/types/database';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = {
  params: { username: string };
};

export default async function SendPage({ params }: Props) {
  const username = params.username?.toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (!username) {
    notFound();
  }

  const supabase = getSupabaseServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at')
    .eq('username', username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  return <SendPageClient profile={profile as Profile} />;
}

export async function generateMetadata({ params }: Props) {
  const username = params.username;
  const ogImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '') || ''}/api/og?username=${username}`;
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
