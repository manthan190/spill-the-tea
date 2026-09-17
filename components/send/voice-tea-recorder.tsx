'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_VOICE_DURATION_SECONDS } from '@/lib/constants';

type VoiceTeaRecorderProps = {
  onRecorded: (data: string, duration: number) => void;
  onCleared: () => void;
  hasRecording: boolean;
};

export function VoiceTeaRecorder({ onRecorded, onCleared, hasRecording }: VoiceTeaRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onRecorded(base64, seconds);
          setProcessing(false);
        };
        reader.readAsDataURL(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      mr.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_VOICE_DURATION_SECONDS) {
            stopRecording();
            return MAX_VOICE_DURATION_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setProcessing(true);
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const clearRecording = () => {
    onCleared();
    setSeconds(0);
  };

  if (hasRecording) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-pink-500/5 border border-pink-500/20 p-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Voice tea recorded</p>
          <p className="text-xs text-zinc-500">{MAX_VOICE_DURATION_SECONDS}s max — tap to re-record</p>
        </div>
        <button
          onClick={clearRecording}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-medium text-white">Voice Tea (10s max)</span>
        </div>
        {recording && (
          <span className="text-xs font-mono text-pink-400">
            0:{seconds.toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {recording ? (
        <div className="flex items-center gap-3">
          {/* Animated waveform */}
          <div className="flex items-center gap-1 flex-1 h-8">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [4, 20 + Math.random() * 12, 4],
                }}
                transition={{
                  duration: 0.3 + Math.random() * 0.2,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
                className="w-1 rounded-full bg-pink-500"
                style={{ height: 4 }}
              />
            ))}
          </div>
          <button
            onClick={stopRecording}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <Square className="w-3 h-3" />
            Stop
          </button>
        </div>
      ) : (
        <button
          onClick={startRecording}
          disabled={processing}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800/50 border border-pink-500/20 hover:border-pink-500/40 py-3 text-sm font-medium text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
        >
          {processing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Mic className="w-4 h-4 text-pink-400" />
              Hold to record voice tea
            </>
          )}
        </button>
      )}
    </div>
  );
}
