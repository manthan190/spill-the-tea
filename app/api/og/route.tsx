import { ImageResponse } from '@vercel/og';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const FONT_FAMILY = 'system-ui, -apple-system, sans-serif';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return new Response('Missing username', { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('username', username)
    .maybeSingle();

  const displayName = profile?.display_name || username;
  const initial = username.charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#020202',
          position: 'relative',
          fontFamily: FONT_FAMILY,
        }}
      >
        {/* Gradient blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: '#FF007A',
            opacity: 0.15,
            filter: 'blur(120px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: '#00DFD8',
            opacity: 0.12,
            filter: 'blur(120px)',
          }}
        />

        {/* Avatar circle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF007A, #7928CA, #00DFD8)',
            padding: '4px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#020202',
              fontSize: '64px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {initial}
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            fontSize: '48px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          Send @{username} a secret message
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            color: '#888888',
            marginBottom: '40px',
          }}
        >
          100% Anonymous. Zero logs. Just tea.
        </div>

        {/* Brand bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 32px',
            borderRadius: '20px',
            background: 'rgba(255, 0, 122, 0.1)',
            border: '1px solid rgba(255, 0, 122, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #FF007A, #7928CA, #00DFD8)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            spillthetea.app/{username}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
