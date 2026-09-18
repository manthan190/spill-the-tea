'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Lock, Smartphone, MapPin, Eye, Sparkles,
  Trash2, Loader2, Zap, MessageCircle, Wand2, Share2,
  Ban, AlertTriangle, Volume2, Play, Mic
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { MessageWithHints, VoiceNote, PaywallTier } from '@/types/database';
import { CheckoutModal } from '@/components/shared/checkout-modal';

type MessageCardProps = {
  message: MessageWithHints;
  onDelete: () => void;
};

export function MessageCard({ message, onDelete }: MessageCardProps) {
  const [comebacks, setComebacks] = useState<string[]>([]);
  const [comebackLoading, setComebackLoading] = useState(false);
  const [showComebacks, setShowComebacks] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [voiceUnlocked, setVoiceUnlocked] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [checkoutTier, setCheckoutTier] = useState<PaywallTier | null>(null);

  const hints = message.message_hints;
  const voiceNote = message.voice_notes?.[0] || null;
  const isMildlyToxic = message.is_flagged === false && hasMildToxicContent(message.content);
  const shouldBlur = message.is_flagged || isMildlyToxic;

  function hasMildToxicContent(text: string): boolean {
    const mildWords = ['stupid', 'idiot', 'dumb', 'hate', 'ugly', 'loser', 'trash', 'garbage', 'pathetic', 'worthless', 'disgusting'];
    const lower = text.toLowerCase();
    return mildWords.some((w) => lower.includes(w));
  }

  const handleUnlock = (tier: PaywallTier) => {
    setCheckoutTier(tier);
  };

  const handleCheckoutSuccess = () => {
    setCheckoutTier(null);
    if (checkoutTier === 'voice') {
      setVoiceUnlocked(true);
    } else if (checkoutTier === 'device') {
      // Optimistic update — webhook will confirm
      if (hints) hints.is_device_unlocked = true;
    } else if (checkoutTier === 'location') {
      if (hints) hints.is_location_unlocked = true;
    } else if (checkoutTier === 'bundle') {
      if (hints) {
        hints.is_device_unlocked = true;
        hints.is_location_unlocked = true;
        hints.is_full_bundle_unlocked = true;
      }
    }
  };

  const generateComebacks = async () => {
    setComebackLoading(true);
    try {
      const res = await fetch('/api/comebacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.content }),
      });

      if (!res.ok) {
        toast.error('Could not generate comebacks');
        return;
      }

      const data = await res.json();
      setComebacks(data.comebacks || []);
      setShowComebacks(true);
    } catch {
      toast.error('Network error');
    } finally {
      setComebackLoading(false);
    }
  };

  const copyComeback = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Comeback copied!');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Someone sent me: "${message.content}" — via spillthetea.app`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const blockSender = async () => {
    setBlocking(true);
    try {
      const res = await fetch('/api/block-sender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: message.id }),
      });

      if (!res.ok) {
        toast.error('Could not block sender');
        return;
      }

      toast.success('Sender blocked. They can no longer message you.');
    } catch {
      toast.error('Network error');
    } finally {
      setBlocking(false);
    }
  };

  const playVoice = () => {
    if (!voiceNote) return;
    if (voicePlaying && audioElement) {
      audioElement.pause();
      setVoicePlaying(false);
      return;
    }
    // Pitch-shifted playback using Web Audio API would go here
    // For now, basic audio playback from base64
    try {
      const audio = new Audio(voiceNote.audio_data);
      audio.playbackRate = 0.85; // Pitch-shift effect
      audio.onended = () => setVoicePlaying(false);
      audio.play();
      setAudioElement(audio);
      setVoicePlaying(true);
    } catch {
      toast.error('Could not play voice note');
    }
  };

  const timeAgo = (() => {
    const diff = Date.now() - new Date(message.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      className={cn(
        'glass glass-hover rounded-2xl p-5 relative overflow-hidden',
        message.is_priority && 'border-amber-400/30'
      )}
    >
      {/* Priority badge */}
      {message.is_priority && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-600 px-3 py-1 rounded-bl-xl flex items-center gap-1">
          <Crown className="w-3 h-3 text-white" />
          <span className="text-xs font-bold text-white">PRIORITY</span>
        </div>
      )}

      {/* Message content */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center flex-shrink-0">
          {message.has_voice ? (
            <Mic className="w-5 h-5 text-pink-400" />
          ) : (
            <MessageCircle className="w-5 h-5 text-zinc-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-zinc-300">Anonymous</span>
            <span className="text-xs text-zinc-600">· {timeAgo}</span>
          </div>

          {/* Sensitive content blur */}
          {shouldBlur && !revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full text-left"
            >
              <div className="rounded-xl bg-zinc-900/50 border border-red-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-red-400">
                    {message.is_flagged ? 'Flagged content' : 'Sensitive content'} — Click to reveal
                  </span>
                </div>
                <p className="text-white leading-relaxed break-words select-none" style={{ filter: 'blur(8px)' }}>
                  {message.content}
                </p>
              </div>
            </button>
          ) : (
            <p className="text-white leading-relaxed break-words">
              {message.content}
            </p>
          )}
          {shouldBlur && revealed && (
            <button
              onClick={() => setRevealed(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 mt-1"
            >
              Hide again
            </button>
          )}
        </div>
      </div>

      {/* Voice note player */}
      {message.has_voice && voiceNote && (
        <div className="mb-4">
          {voiceUnlocked || voiceNote.is_voice_unlocked ? (
            <div className="flex items-center gap-3 rounded-xl bg-pink-500/5 border border-pink-500/20 p-3">
              <button
                onClick={playVoice}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0"
              >
                {voicePlaying ? (
                  <span className="text-white text-lg">⏸</span>
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-pink-400" />
                  <span className="text-xs text-zinc-400">
                    Voice Tea · {voiceNote.duration_seconds}s · pitch-shifted
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: voicePlaying ? '60%' : '0%' }} />
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleUnlock('voice')}
              className="w-full flex items-center gap-2 rounded-lg bg-zinc-900/50 border border-pink-500/20 hover:border-pink-500/40 px-3 py-2.5 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600">
                <Lock className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs text-zinc-400 flex-1 text-left">Unlock Voice Tea</span>
              <span className="text-xs font-bold text-white">₹29</span>
              <Zap className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      )}

      {/* Hints section */}
      {hints && (
        <div className="space-y-2 mb-4">
          {/* IG First Letter (free) */}
          {hints.ig_first_letter && (
            <div className="flex items-center gap-2 rounded-lg bg-cyan-400/5 border border-cyan-400/20 px-3 py-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-zinc-400">
                IG handle starts with{' '}
                <span className="font-bold text-cyan-400 uppercase">
                  {hints.ig_first_letter}
                </span>
              </span>
            </div>
          )}

          {/* Device hint (paywalled) */}
          <PaywallRow
            icon={Smartphone}
            label="Device & Browser"
            price="₹19"
            unlocked={hints.is_device_unlocked}
            onUnlock={() => handleUnlock('device')}
            revealedContent={
              hints.is_device_unlocked
                ? `${hints.device} · ${hints.browser}`
                : null
            }
            gradient="from-pink-500 to-rose-600"
          />

          {/* Location hint (paywalled) */}
          <PaywallRow
            icon={MapPin}
            label="City & Network"
            price="₹35"
            unlocked={hints.is_location_unlocked}
            onUnlock={() => handleUnlock('location')}
            revealedContent={
              hints.is_location_unlocked
                ? `${hints.city || 'Unknown'} · ${hints.network || 'Unknown'}`
                : null
            }
            gradient="from-cyan-400 to-teal-500"
          />

          {/* Full bundle (paywalled) */}
          <PaywallRow
            icon={Sparkles}
            label="Complete Sender Hints Bundle"
            price="₹49"
            unlocked={hints.is_full_bundle_unlocked}
            onUnlock={() => handleUnlock('bundle')}
            revealedContent={
              hints.is_full_bundle_unlocked
                ? `${hints.device} · ${hints.browser} · ${hints.city || '?'} · ${hints.network || '?'}`
                : null
            }
            gradient="from-purple-500 to-indigo-600"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/50 flex-wrap">
        <button
          onClick={generateComebacks}
          disabled={comebackLoading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 px-3 py-2 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
        >
          {comebackLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          AI Comeback
        </button>

        <button
          onClick={shareToWhatsApp}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          WhatsApp
        </button>

        <button
          onClick={blockSender}
          disabled={blocking}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {blocking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Ban className="w-3.5 h-3.5" />
          )}
          Block
        </button>

        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Comebacks */}
      <AnimatePresence>
        {showComebacks && comebacks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-zinc-800/50 space-y-2"
          >
            <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Spicy Hinglish comebacks for your IG story:
            </div>
            {comebacks.map((comeback, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 rounded-lg bg-purple-500/5 border border-purple-500/20 p-3 group cursor-pointer hover:bg-purple-500/10 transition-colors"
                onClick={() => copyComeback(comeback)}
              >
                <span className="text-xs text-zinc-300 flex-1">{comeback}</span>
                <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  Copy
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      {checkoutTier && (
        <CheckoutModal
          tier={checkoutTier}
          messageId={message.id}
          onClose={() => setCheckoutTier(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </motion.div>
  );
}

type PaywallRowProps = {
  icon: typeof Smartphone;
  label: string;
  price: string;
  unlocked: boolean;
  onUnlock: () => void;
  revealedContent: string | null;
  gradient: string;
};

function PaywallRow({
  icon: Icon,
  label,
  price,
  unlocked,
  onUnlock,
  revealedContent,
  gradient,
}: PaywallRowProps) {
  if (unlocked && revealedContent) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-500/5 border border-green-500/20 px-3 py-2">
        <Icon className="w-4 h-4 text-green-400" />
        <span className="text-xs text-zinc-300 flex-1">{revealedContent}</span>
        <span className="text-xs text-green-400">Unlocked</span>
      </div>
    );
  }

  return (
    <button
      onClick={onUnlock}
      className="w-full flex items-center gap-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 px-3 py-2 transition-all group"
    >
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br', gradient)}>
        <Lock className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-xs text-zinc-400 flex-1 text-left">{label}</span>
      <span className="text-xs font-bold text-white">{price}</span>
      <Zap className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
