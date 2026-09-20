'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';

type AvailabilityState = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export function OnboardingForm() {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [availability, setAvailability] = useState<AvailabilityState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Debounced availability check
  const checkAvailability = useCallback((username: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (username.length < 2) {
      setAvailability('idle');
      return;
    }

    setAvailability('checking');

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/check?username=${encodeURIComponent(username)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          const errorMsg = data?.error || 'Availability check failed';
          console.error('Availability check error:', errorMsg);
          setAvailability('error');
          return;
        }

        setAvailability(data.available ? 'available' : 'taken');
      } catch (err) {
        console.error('Availability check network error:', err);
        // Don't block the user on transient network failures
        setAvailability('error');
      }
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = sanitize(e.target.value);
    setHandle(val);
    checkAvailability(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = sanitize(handle);
    if (!cleanHandle || cleanHandle.length < 2) {
      toast.error('Handle needs at least 2 characters');
      return;
    }

    // If we already know it's taken, block early
    if (availability === 'taken') {
      toast.error('That handle is already taken. Try another one.');
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

      if (!res.ok || !data.success) {
        const errorMsg = data?.error || data?.details?.message || 'Could not create your link';
        toast.error(errorMsg);
        return;
      }

      const profile = data.profile;
      if (!profile?.id || !profile?.username) {
        toast.error('Received an invalid response from the server');
        return;
      }

      localStorage.setItem('stt_user_id', profile.id);
      localStorage.setItem('stt_username', profile.username);

      toast.success(data.existing ? 'Welcome back!' : 'Your link is ready!');
      router.push('/inbox');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error. Try again.';
      console.error('Profile creation error:', errorMsg);
      toast.error(errorMsg);
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
            onChange={handleInputChange}
            placeholder="yourname"
            maxLength={20}
            className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none py-3 text-lg font-medium"
            autoComplete="off"
            spellCheck={false}
          />
          {/* Availability indicator */}
          <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
            {availability === 'checking' && (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            )}
            {availability === 'available' && (
              <Check className="w-4 h-4 text-green-400" />
            )}
            {availability === 'taken' && (
              <X className="w-4 h-4 text-red-400" />
            )}
          </div>
          <motion.button
            type="submit"
            disabled={loading || handle.length < 2 || availability === 'taken'}
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
        {/* Availability message */}
        {handle.length >= 2 && (
          <div className="text-xs text-center min-h-[16px]">
            {availability === 'available' && (
              <span className="text-green-400">Good news — this handle is available!</span>
            )}
            {availability === 'taken' && (
              <span className="text-red-400">Sorry, this handle is already taken.</span>
            )}
            {availability === 'error' && (
              <span className="text-zinc-500">Couldn't check availability — you can still try claiming.</span>
            )}
          </div>
        )}
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
