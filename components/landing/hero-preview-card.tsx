'use client';

import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const SAMPLE_MESSAGES = [
  { text: 'Your fit pics are literally iconic no cap', emoji: '🔥' },
  { text: 'someone has a massive crush on you and is too scared to say it', emoji: '👀' },
  { text: 'your stories are the only reason I open IG anymore', emoji: '💜' },
  { text: 'bro your playlist recommendations are unmatched', emoji: '🎵' },
  { text: 'you give main character energy and everyone knows it', emoji: '✨' },
];

export function HeroPreviewCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SAMPLE_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 80 }}
      whileHover={{ y: -8, rotateX: 5, rotateY: -3 }}
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      className="relative w-full max-w-sm"
    >
      {/* Glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />

      <div className="relative glass rounded-3xl p-6 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              @
            </div>
            <div>
              <div className="text-sm font-semibold text-white">anonymous</div>
              <div className="text-xs text-zinc-500">just now</div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-pink-500/10 px-2.5 py-1">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span className="text-xs font-medium text-pink-400">Tea</span>
          </div>
        </div>

        {/* Message content */}
        <div className="min-h-[80px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-lg text-white leading-relaxed"
            >
              {SAMPLE_MESSAGES[index].emoji}{' '}
              {SAMPLE_MESSAGES[index].text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Bottom decoration */}
        <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
          <span className="text-xs text-zinc-600">spillthetea.app</span>
        </div>
      </div>

      {/* Floating sparkles */}
      <motion.div
        className="absolute -top-3 -right-3 text-pink-400"
        animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Sparkles className="w-5 h-5" />
      </motion.div>
    </motion.div>
  );
}
