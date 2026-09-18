'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Lock, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { PAYWALL_TIERS, type PaywallTier } from '@/types/database';

type CheckoutModalProps = {
  tier: PaywallTier;
  messageId: string;
  onClose: () => void;
  onSuccess: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: Record<string, string>) => void) => void;
    };
  }
}

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

export function CheckoutModal({ tier, messageId, onClose, onSuccess }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const tierConfig = PAYWALL_TIERS[tier];
  const displayRupees = (tierConfig.amount / 100).toFixed(0);

  const handlePay = async () => {
    setLoading(true);
    try {
      // Create the order on the server
      const res = await fetch('/api/paywall/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, messageId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Could not start payment');
        setLoading(false);
        return;
      }

      // Demo mode — no real Razorpay keys configured
      if (data.demoMode) {
        toast.info('Payments are in demo mode. Unlocking for free!');
        onSuccess();
        return;
      }

      // Load the Razorpay checkout script
      await loadRazorpayScript();

      if (!window.Razorpay) {
        toast.error('Payment SDK failed to load');
        setLoading(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Spill The Tea',
        description: tierConfig.label,
        order_id: data.orderId,
        prefill: {
          // No email or contact — anonymous checkout
        },
        theme: {
          color: '#FF007A',
        },
        handler: function () {
          // The webhook handles the actual unlock.
          // We just tell the user it's processing.
          toast.success('Payment received! Unlocking...');
          // Poll for unlock after a short delay
          setTimeout(() => {
            onSuccess();
          }, 2000);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: Record<string, unknown>) {
        const err = response.error as { description?: string } | undefined;
        toast.error(err?.description || 'Payment failed');
        setLoading(false);
      });
      rzp.open();
    } catch {
      toast.error('Could not start payment');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-sm glass glass-hover rounded-3xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center glow-pink">
              {tier === 'express' ? (
                <Crown className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white text-center font-display mb-1">
            {tierConfig.label}
          </h3>
          <p className="text-sm text-zinc-500 text-center mb-6">
            {tierConfig.description}
          </p>

          {/* Price */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl font-bold text-white font-display">
              ₹{displayRupees}
            </span>
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3.5 font-semibold text-white glow-pink disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Pay ₹{displayRupees}
              </>
            )}
          </button>

          <p className="text-center text-xs text-zinc-600 mt-3">
            Secure payment via Razorpay. Instant unlock.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
