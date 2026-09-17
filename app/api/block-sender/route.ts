import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { messageId } = await req.json();

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    // Get the message to find recipient_id and the sender IP from hints
    const { data: message } = await supabase
      .from('messages')
      .select('id, recipient_id')
      .eq('id', messageId)
      .maybeSingle();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const { data: hint } = await supabase
      .from('message_hints')
      .select('sender_ip')
      .eq('message_id', messageId)
      .maybeSingle();

    if (!hint || !hint.sender_ip) {
      return NextResponse.json({ error: 'Could not identify sender' }, { status: 400 });
    }

    // Block the sender's IP
    const { error } = await supabase
      .from('blocked_ips')
      .insert({
        profile_id: message.recipient_id,
        ip_address: hint.sender_ip,
      });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true, alreadyBlocked: true });
      }
      return NextResponse.json({ error: 'Failed to block sender' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
