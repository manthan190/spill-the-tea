'use client';

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  gradient: string;
  delay?: number;
  className?: string;
};

export function StatCard({
  icon: Icon,
  value,
  label,
  gradient,
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, type: 'spring', stiffness: 120 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        'glass glass-hover rounded-2xl p-5 sm:p-6 relative overflow-hidden group',
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br',
          gradient
        )}
      />
      <div className="relative z-10">
        <div
          className={cn(
            'inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 bg-gradient-to-br',
            gradient
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-display text-white mb-1">
          {value}
        </div>
        <div className="text-sm text-zinc-400">{label}</div>
      </div>
    </motion.div>
  );
}
