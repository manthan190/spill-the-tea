import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { PAYWALL_TIERS } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const { tier, messageId } = await req.json();

    if (!tier || !messageId) {
      return NextResponse.json(
        { error: 'Tier and message ID are required' },
        { status: 400 }
      );
    }

    const tierConfig = PAYWALL_TIERS[tier as keyof typeof PAYWALL_TIERS];
    if (!tierConfig) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    // Create a payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        message_id: messageId,
        tier,
        amount: tierConfig.amount,
        status: 'created',
      })
      .select()
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    // In production, this would create a Razorpay order:
    //
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // });
    // const order = await razorpay.orders.create({
    //   amount: tierConfig.amount,
    //   currency: 'INR',
    //   receipt: payment.id,
    //   notes: { tier, message_id: messageId },
    // });
    //
    // await supabase.from('payments').update({
    //   razorpay_order_id: order.id,
    //   status: 'order_created',
    // }).eq('id', payment.id);

    return NextResponse.json({
      paymentId: payment.id,
      tier,
      amount: tierConfig.amount,
      label: tierConfig.label,
      message: 'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable payments.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
