import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Verify HMAC-SHA256 signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const supabase = getSupabaseServiceClient();

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // Find the payment record by order ID
      const { data: payment, error: findError } = await supabase
        .from('payments')
        .select('id, tier, message_id, processed_at, status')
        .eq('razorpay_order_id', orderId)
        .maybeSingle();

      if (findError || !payment) {
        console.error('Payment record not found for order:', orderId);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // IDEMPOTENCY CHECK: if already processed, return success without re-executing
      if (payment.processed_at) {
        return NextResponse.json({ received: true, idempotent: true });
      }

      // Atomically claim the payment by setting processed_at (prevents race conditions)
      const { data: claimed, error: claimError } = await supabase
        .from('payments')
        .update({
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          status: 'captured',
          processed_at: new Date().toISOString(),
        })
        .eq('id', payment.id)
        .is('processed_at', null)
        .select('id, tier, message_id')
        .maybeSingle();

      if (claimError || !claimed) {
        // Another webhook beat us to it — already processed
        return NextResponse.json({ received: true, idempotent: true });
      }

      // Unlock the appropriate hint tier
      if (claimed.tier === 'express') {
        await supabase
          .from('messages')
          .update({ is_priority: true })
          .eq('id', claimed.message_id);
      } else if (claimed.tier === 'voice') {
        await supabase
          .from('voice_notes')
          .update({ is_voice_unlocked: true })
          .eq('message_id', claimed.message_id);
      } else {
        const updateMap: Record<string, Record<string, boolean>> = {
          device: { is_device_unlocked: true },
          location: { is_location_unlocked: true },
          bundle: {
            is_device_unlocked: true,
            is_location_unlocked: true,
            is_full_bundle_unlocked: true,
          },
        };

        const updates = updateMap[claimed.tier];
        if (updates) {
          await supabase
            .from('message_hints')
            .update(updates)
            .eq('message_id', claimed.message_id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
