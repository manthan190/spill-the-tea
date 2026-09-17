'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

type SecretFlameWidgetProps = {
  profileId: string;
};

export function SecretFlameWidget({ profileId }: SecretFlameWidgetProps) {
  const [count, setCount] = useState(0);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/crush?profileId=${profileId}`)
      .then((res) => res.json())
      .then((data) => setCount(data.count || 0))
      .catch(() => {});
  }, [profileId]);

  const handleAdd = async () => {
    if (added) return;
    setLoading(true);
    try {
      const res = await fetch('/api/crush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCount(data.count || 0);
        setAdded(true);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`glass rounded-2xl p-4 flex items-center gap-3 transition-all ${
          added ? 'border-pink-500/40 glow-pink' : 'border-pink-500/20'
        }`}
      >
        <div className="relative">
          <motion.div
            animate={added ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center"
          >
            <Flame className="w-5 h-5 text-white" />
          </motion.div>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 text-xs font-bold text-white bg-pink-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
            >
              {count}
            </motion.span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            {count > 0 ? (
              <>
                <span className="text-gradient-pink font-bold">{count}</span> people added{' '}
                <span className="text-zinc-400">to their crush list this week</span>
              </>
            ) : (
              'Be the first to add to the crush list'
            )}
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={added || loading}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all flex-shrink-0 ${
            added
              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white glow-pink hover:scale-105'
          } disabled:opacity-70`}
        >
          {added ? 'Added!' : loading ? '...' : 'Add'}
        </button>
      </motion.div>
    </motion.div>
  );
}
