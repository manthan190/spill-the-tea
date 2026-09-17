import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { getToxicityLevel, MAX_MESSAGE_LENGTH, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MINUTES } from '@/lib/constants';

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

function parseUserAgent(ua: string): { device: string; browser: string } {
  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
  let browser = 'Unknown';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  return { device, browser };
}

function getNetworkFromHost(host: string | null): string {
  if (!host) return 'Unknown';
  const parts = host.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.').replace(/^www\./, '');
  }
  return host;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientUsername, content, igFirstLetter, isPriority, voiceData, voiceDuration } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!recipientUsername) {
      return NextResponse.json({ error: 'Recipient is required' }, { status: 400 });
    }

    const ip = getClientIP(req);
    const supabase = getSupabaseServiceClient();

    // Check if this IP is blocked by the recipient
    const { data: recipient } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', recipientUsername)
      .maybeSingle();

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const { data: blocked } = await supabase
      .from('blocked_ips')
      .select('id')
      .eq('profile_id', recipient.id)
      .eq('ip_address', ip)
      .maybeSingle();

    if (blocked) {
      return NextResponse.json(
        { error: 'You have been blocked from sending messages to this person.' },
        { status: 403 }
      );
    }

    // Rate limiting: check recent messages from this IP
    const tenMinutesAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', tenMinutesAgo);

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Too many messages. Slow down and try again in a few minutes.' },
        { status: 429 }
      );
    }

    // Toxic content moderation
    const toxicity = getToxicityLevel(content);
    const isFlagged = toxicity === 'severe';
    const isMildlyToxic = toxicity === 'mild';

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        recipient_id: recipient.id,
        content: content.trim(),
        is_priority: Boolean(isPriority),
        is_flagged: isFlagged,
        has_voice: Boolean(voiceData),
      })
      .select()
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Edge geolocation: use request.geo (Vercel/Next.js native) with fallback
    const geo = (req as NextRequest & { geo?: { city?: string; region?: string; country?: string } }).geo;
    const city = geo?.city || null;
    const country = geo?.country || null;
    const region = geo?.region || null;

    // Derive network from host header
    const host = req.headers.get('host');
    const network = getNetworkFromHost(host);

    // Insert hints (locked by default) with sender IP for blocking
    const ua = req.headers.get('user-agent') || '';
    const { device, browser } = parseUserAgent(ua);

    const locationStr = [city, region, country].filter(Boolean).join(', ') || null;

    const { error: hintError } = await supabase.from('message_hints').insert({
      message_id: message.id,
      device,
      browser,
      city: locationStr,
      network,
      ig_first_letter: igFirstLetter || null,
      sender_ip: ip,
    });

    if (hintError) {
      console.error('Failed to insert hints:', hintError);
    }

    // Insert voice note if provided
    if (voiceData) {
      const { error: voiceError } = await supabase.from('voice_notes').insert({
        message_id: message.id,
        audio_data: voiceData,
        duration_seconds: Math.min(voiceDuration || 10, 10),
      });

      if (voiceError) {
        console.error('Failed to insert voice note:', voiceError);
      }
    }

    // Record rate limit
    await supabase.from('rate_limits').insert({ ip_address: ip });

    // Cleanup old rate limit entries occasionally
    if (Math.random() < 0.1) {
      try {
        await supabase.rpc('cleanup_old_rate_limits');
      } catch {}
    }

    return NextResponse.json({
      success: true,
      messageId: message.id,
      isFlagged,
      isMildlyToxic,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
