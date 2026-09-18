import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { PAYWALL_TIERS } from '@/types/database';
import Razorpay from 'razorpay';

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

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const supabase = getSupabaseServiceClient();

    // Create a payment record (amount stored in paise)
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

    // If Razorpay keys are not configured, return the payment record in demo mode
    if (!keyId || !keySecret) {
      return NextResponse.json({
        paymentId: payment.id,
        tier,
        amount: tierConfig.amount,
        label: tierConfig.label,
        demoMode: true,
        message: 'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable live payments.',
      });
    }

    // Create a Razorpay order
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: tierConfig.amount, // already in paise (₹9 = 900)
      currency: 'INR',
      receipt: payment.id,
      notes: {
        tier,
        message_id: messageId,
        payment_id: payment.id,
      },
    });

    // Store the order ID on the payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        razorpay_order_id: order.id,
        status: 'order_created',
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment with order ID:', updateError.message);
    }

    return NextResponse.json({
      paymentId: payment.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      tier,
      label: tierConfig.label,
      keyId, // exposed publicly — this is the test/public key, safe for client
      demoMode: false,
    });
  } catch (err) {
    console.error('Paywall error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
