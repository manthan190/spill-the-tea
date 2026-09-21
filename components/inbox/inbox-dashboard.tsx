'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Link2, Coffee, Trash2, Loader2, Sparkles, Crown, Lock, MapPin, Smartphone, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { MessageWithHints, Profile } from '@/types/database';
import { MessageCard } from '@/components/inbox/message-card';
import { IgStoryGenerator } from '@/components/inbox/ig-story-generator';

export function InboxDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<MessageWithHints[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStoryGen, setShowStoryGen] = useState(false);
  const supabase = getSupabaseClient();

  const loadProfile = useCallback(async () => {
    const userId = localStorage.getItem('stt_user_id');
    const username = localStorage.getItem('stt_username');

    if (!userId || !username) {
      window.location.href = '/';
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else {
      // Create profile if it doesn't exist yet (edge case)
      setProfile({
        id: userId,
        username,
        display_name: username,
        avatar_url: null,
        created_at: new Date().toISOString(),
      });
    }
  }, [supabase]);

  const loadMessages = useCallback(async () => {
    const userId = localStorage.getItem('stt_user_id');
    if (!userId) return;

    const { data } = await supabase
      .from('messages')
      .select('*, message_hints(*), voice_notes(*)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setMessages(data as MessageWithHints[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadProfile();
    loadMessages();
  }, [loadProfile, loadMessages]);

  // Realtime subscription
  useEffect(() => {
    const userId = localStorage.getItem('stt_user_id');
    if (!userId) return;

    const channel = supabase
      .channel('inbox-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newMessage = payload.new as MessageWithHints;
          newMessage.message_hints = null;
          newMessage.voice_notes = null;
          setMessages((prev) => [newMessage, ...prev]);
          toast.success('New tea arrived! ☕️');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_hints',
          filter: `is_device_unlocked=eq.true`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadMessages]);

  const copyLink = () => {
    if (!profile) return;
    const link = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied! Share it on your IG story');
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) {
      toast.error('Could not delete message');
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast.success('Message deleted');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const priorityMessages = messages.filter((m) => m.is_priority);
  const regularMessages = messages.filter((m) => !m.is_priority);

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-40 backdrop-blur-2xl bg-zinc-950/60 border-b border-zinc-900">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-display text-white">
              Spill<span className="text-gradient">TheTea</span>
            </span>
          </a>
          <a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Home
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 pt-6">
        {/* Share bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass glass-hover rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 p-0.5 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-xl font-bold text-white font-display">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white font-display truncate">
                @{profile.username}
              </h1>
              <p className="text-xs text-zinc-500 truncate">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'} received
              </p>
            </div>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white glow-pink hover:scale-105 transition-transform flex-shrink-0"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy Link</span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-900/50 border border-zinc-800 px-3 py-2.5">
            <Link2 className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <span className="text-sm text-zinc-400 truncate flex-1">
              spillthetea.app/{profile.username}
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowStoryGen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-400/20 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              IG Story Card
            </button>
          </div>
        </motion.div>

        {/* Messages */}
        {messages.length === 0 ? (
          <EmptyState username={profile.username} />
        ) : (
          <div className="space-y-4">
            {/* Priority messages */}
            {priorityMessages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">
                    Priority Tea
                  </span>
                </div>
                <div className="space-y-4">
                  <AnimatePresence>
                    {priorityMessages.map((msg) => (
                      <MessageCard
                        key={msg.id}
                        message={msg}
                        onDelete={() => handleDelete(msg.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Regular messages */}
            {regularMessages.length > 0 && (
              <div>
                {priorityMessages.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 px-1 mt-6">
                    <Coffee className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-semibold text-zinc-400">
                      All Tea
                    </span>
                  </div>
                )}
                <div className="space-y-4">
                  <AnimatePresence>
                    {regularMessages.map((msg) => (
                      <MessageCard
                        key={msg.id}
                        message={msg}
                        onDelete={() => handleDelete(msg.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* IG Story Generator Modal */}
      <AnimatePresence>
        {showStoryGen && profile && (
          <IgStoryGenerator
            username={profile.username}
            onClose={() => setShowStoryGen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function EmptyState({ username }: { username: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-12 text-center"
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900 flex items-center justify-center mb-4">
        <Coffee className="w-10 h-10 text-zinc-600" />
      </div>
      <h3 className="text-xl font-bold text-white font-display mb-2">
        No tea yet
      </h3>
      <p className="text-zinc-500 text-sm mb-6">
        Share your link on IG stories to start receiving anonymous messages
      </p>
      <div className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-3 max-w-xs mx-auto">
        <Link2 className="w-4 h-4 text-pink-400" />
        <span className="text-sm text-zinc-300">
          spillthetea.app/{username}
        </span>
      </div>
    </motion.div>
  );
}
