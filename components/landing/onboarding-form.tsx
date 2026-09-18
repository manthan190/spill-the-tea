'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

export function OnboardingForm() {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  const sanitize = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);

  // Check for an existing session in localStorage before showing the form.
  // Returning users skip straight to their inbox.
  useEffect(() => {
    const savedUserId = localStorage.getItem('stt_user_id');
    const savedUsername = localStorage.getItem('stt_username');

    if (savedUserId && savedUsername) {
      router.replace('/inbox');
      return;
    }

    setCheckingSession(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = sanitize(handle);
    if (!cleanHandle || cleanHandle.length < 2) {
      toast.error('Handle needs at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanHandle }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Could not create your link');
        return;
      }

      localStorage.setItem('stt_user_id', data.userId);
      localStorage.setItem('stt_username', cleanHandle);

      toast.success('Your link is ready!');
      router.push('/inbox');
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="w-full max-w-md flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2 rounded-2xl glass glass-hover p-1.5">
          <div className="flex items-center pl-4 pr-1 text-zinc-500 font-medium">
            spillthetea.app/
          </div>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(sanitize(e.target.value))}
            placeholder="yourname"
            maxLength={20}
            className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none py-3 text-lg font-medium"
            autoComplete="off"
            spellCheck={false}
          />
          <motion.button
            type="submit"
            disabled={loading || handle.length < 2}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-semibold text-white glow-pink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Claim
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-cyan-400" /> Free forever
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-cyan-400" /> No app download
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-400" /> Instant link
          </span>
        </div>
      </form>
    </motion.div>
  );
}
