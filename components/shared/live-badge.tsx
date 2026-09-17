'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type LiveBadgeProps = {
  count?: number;
  label?: string;
};

export function LiveBadge({
  count = 14,
  label = 'people are typing anonymous tea right now...',
}: LiveBadgeProps) {
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(3, prev + delta);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 rounded-full bg-zinc-950/80 backdrop-blur-xl border border-pink-500/30 px-4 py-2"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-500 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pink-500" />
      </span>
      <span className="text-sm font-medium text-zinc-200">
        <span className="text-gradient-pink font-bold">{displayCount}</span>{' '}
        {label}
      </span>
    </motion.div>
  );
}
