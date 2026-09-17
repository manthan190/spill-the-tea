'use client';

import { motion } from 'framer-motion';
import { Flame, Zap, Lock, Coffee, MessageCircle, TrendingUp } from 'lucide-react';
import { OnboardingForm } from '@/components/landing/onboarding-form';
import { HeroPreviewCard } from '@/components/landing/hero-preview-card';
import { LiveBadge } from '@/components/shared/live-badge';
import { StatCard } from '@/components/shared/stat-card';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center glow-pink">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display text-white">
            Spill<span className="text-gradient">TheTea</span>
          </span>
        </motion.div>
        <motion.a
          href="/inbox"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
        >
          My Inbox
        </motion.a>
      </nav>

      {/* Hero */}
      <section className="px-5 sm:px-8 pt-8 sm:pt-16 pb-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <LiveBadge count={14} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display text-white leading-[1.05] mb-4"
            >
              Say Less.
              <br />
              <span className="text-gradient animate-gradient-shift">Spill More.</span>{' '}
              <span className="inline-block">☕️</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-zinc-400 max-w-md mb-8"
            >
              Get anonymous messages from your followers. Share your link on IG
              stories and let the tea flow. 100% anonymous. Zero logs. Pure chaos.
            </motion.p>

            <OnboardingForm />
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="px-5 sm:px-8 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-2">
            Why the <span className="text-gradient">hype</span>?
          </h2>
          <p className="text-zinc-500">The numbers speak for themselves</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Flame}
            value="2.4M"
            label="Cups Spilled"
            gradient="from-pink-500 to-rose-600"
            delay={0}
          />
          <StatCard
            icon={Zap}
            value="3.2s"
            label="Avg Response Time"
            gradient="from-cyan-400 to-teal-500"
            delay={0.1}
          />
          <StatCard
            icon={Lock}
            value="100%"
            label="Zero-Log Privacy"
            gradient="from-purple-500 to-indigo-600"
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            value="89K"
            label="Active Spillers"
            gradient="from-amber-400 to-orange-500"
            delay={0.3}
          />
        </div>

        {/* Feature bento */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass glass-hover rounded-2xl p-6 md:col-span-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br from-pink-500 to-purple-600" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white font-display">
                  Anonymous by default
                </h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Senders never reveal their identity. You can unlock hints
                (device, city, IG first letter) for a small fee — but only if
                you choose to. Total control, zero pressure.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass glass-hover rounded-2xl p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br from-cyan-400 to-teal-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white font-display">
                  Express Tea
                </h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pin your message to the top with a golden badge for ₹9. Stand
                out from the noise.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 sm:px-8 py-10 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              SpillTheTea
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <a href="/terms" className="text-zinc-500 hover:text-white transition-colors">
              Terms
            </a>
            <a href="/privacy" className="text-zinc-500 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="/refunds" className="text-zinc-500 hover:text-white transition-colors">
              Refunds
            </a>
          </div>
          <p className="text-xs text-zinc-600">
            Built with love. Spill responsibly. ☕️
          </p>
        </div>
      </footer>
    </main>
  );
}
