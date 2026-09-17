'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coffee, ArrowRight, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { LiveBadge } from '@/components/shared/live-badge';
import { SecretFlameWidget } from '@/components/send/secret-flame-widget';
import { VoiceTeaRecorder } from '@/components/send/voice-tea-recorder';
import type { Profile } from '@/types/database';
import { MAX_MESSAGE_LENGTH } from '@/lib/constants';

type SendPageClientProps = {
  profile: Profile;
};

export function SendPageClient({ profile }: SendPageClientProps) {
  const [content, setContent] = useState('');
  const [igFirstLetter, setIgFirstLetter] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [voiceData, setVoiceData] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Write something first!');
      return;
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Keep it under ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUsername: profile.username,
          content,
          igFirstLetter: igFirstLetter || undefined,
          isPriority,
          voiceData: voiceData || undefined,
          voiceDuration: voiceDuration || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Could not send your tea');
        return;
      }

      setSuccess(true);
    } catch {
      toast.error('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <SuccessCard username={profile.username} />;
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Profile header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 p-0.5">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-2xl font-bold text-white font-display">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pink-500 border-2 border-zinc-950 flex items-center justify-center">
              <Coffee className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            @{profile.username}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Send me anonymous tea ☕️
          </p>
        </div>

        {/* Live badge */}
        <div className="flex justify-center mb-4">
          <LiveBadge count={14} label="people are typing anonymous tea right now..." />
        </div>

        {/* Secret Flame widget */}
        <div className="mb-4">
          <SecretFlameWidget profileId={profile.id} />
        </div>

        {/* Message form */}
        <div className="glass glass-hover rounded-3xl p-6 space-y-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Spill the tea... be honest, be messy, be anonymous"
              maxLength={MAX_MESSAGE_LENGTH}
              rows={5}
              className="w-full bg-zinc-900/50 rounded-2xl p-4 text-white placeholder-zinc-600 outline-none resize-none border border-zinc-800 focus:border-pink-500/50 transition-colors text-base leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 text-xs text-zinc-600">
              {content.length}/{MAX_MESSAGE_LENGTH}
            </div>
          </div>

          {/* IG first letter */}
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">
              Optional: First letter of your IG handle (for a hint)
            </label>
            <input
              type="text"
              value={igFirstLetter}
              onChange={(e) => setIgFirstLetter(e.target.value.slice(0, 1).toLowerCase())}
              placeholder="?"
              maxLength={1}
              className="w-16 bg-zinc-900/50 rounded-xl p-3 text-center text-white text-lg font-bold outline-none border border-zinc-800 focus:border-cyan-400/50 transition-colors"
            />
          </div>

          {/* Voice Tea Recorder */}
          <VoiceTeaRecorder
            onRecorded={(data, duration) => {
              setVoiceData(data);
              setVoiceDuration(duration);
            }}
            onCleared={() => {
              setVoiceData(null);
              setVoiceDuration(0);
            }}
            hasRecording={voiceData !== null}
          />

          {/* Express Tea toggle */}
          <button
            type="button"
            onClick={() => setIsPriority(!isPriority)}
            className={`w-full flex items-center justify-between rounded-2xl p-4 border transition-all ${
              isPriority
                ? 'border-amber-400/50 bg-amber-400/10 glow-gold'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-amber-400/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isPriority ? 'bg-gradient-to-br from-amber-400 to-yellow-600' : 'bg-zinc-800'
              }`}>
                <Crown className={`w-5 h-5 ${isPriority ? 'text-white' : 'text-zinc-500'}`} />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">
                  Express Tea (Priority Pin)
                </div>
                <div className="text-xs text-zinc-500">
                  Pin at top with a golden badge
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-400">₹9</div>
              <div className={`text-xs ${isPriority ? 'text-amber-400' : 'text-zinc-600'}`}>
                {isPriority ? 'Selected' : 'Tap to add'}
              </div>
            </div>
          </button>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 font-semibold text-white glow-pink disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Spill the Tea
              </>
            )}
          </motion.button>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Your message is 100% anonymous. No logs. No tracking. Just tea.
        </p>
      </motion.div>
    </main>
  );
}

function SuccessCard({ username }: { username: string }) {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="w-full max-w-md text-center"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center glow-pink mb-6"
          >
            <Coffee className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold font-display text-white mb-2"
          >
            Tea <span className="text-gradient">Spilled!</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-zinc-400 mb-8"
          >
            Your anonymous message has been delivered to @{username}. They'll
            see it in their inbox.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass glass-hover rounded-2xl p-6 mb-6"
          >
            <p className="text-sm text-zinc-400 mb-4">
              Want to receive anonymous tea too?
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white glow-pink hover:scale-105 transition-transform"
            >
              Claim Your Own Link
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => window.location.reload()}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Send another tea →
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
