'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Loader2, Coffee, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';

type IgStoryGeneratorProps = {
  username: string;
  onClose: () => void;
};

function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('instagram') || ua.includes('fban') || ua.includes('fbav') || ua.includes('whatsapp');
}

export function IgStoryGenerator({ username, onClose }: IgStoryGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [inWebView, setInWebView] = useState(false);

  useEffect(() => {
    setInWebView(isInAppBrowser());
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `spillthetea-${username}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Image downloaded! Post it on your IG story');
    } catch {
      toast.error('Could not generate image. Try again.');
    } finally {
      setDownloading(false);
    }
  };

  const openInBrowser = () => {
    const url = window.location.href;
    // Try to trigger native browser opening
    const a = document.createElement('a');
    a.href = `intent://${url.replace('https://', '')}#Intent;scheme=https;action=android.intent.action.VIEW;end;`;
    a.click();
    // Fallback: copy link
    navigator.clipboard.writeText(url);
    toast.success('Link copied! Open in your browser app');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white font-display">
            IG Story Card
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* In-App Browser overlay */}
        {inWebView && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-amber-400/10 border border-amber-400/30 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-200 font-medium mb-1">
                  You're inside an in-app browser
                </p>
                <p className="text-xs text-amber-300/70 mb-3">
                  Long-press the image below to save it, or open this page in
                  your system browser for a proper download button.
                </p>
                <button
                  onClick={openInBrowser}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/20 border border-amber-400/40 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/30 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in System Browser
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 9:16 Story Card */}
        <div className="flex justify-center mb-4">
          <div
            ref={cardRef}
            className="relative w-[270px] h-[480px] rounded-2xl overflow-hidden"
            style={{ background: '#020202' }}
          >
            {/* Background gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, rgba(255,0,122,0.25) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,223,216,0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(121,40,202,0.15) 0%, transparent 60%)',
              }}
            />

            {/* Top header sticker */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 flex items-center justify-center">
              <span className="text-white font-bold text-lg font-display">
                Spill the tea on me ☕️👇
              </span>
            </div>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 p-1 mb-4">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-3xl font-bold text-white font-display">
                  {username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="text-2xl font-bold text-white font-display mb-2">
                @{username}
              </div>
              <div className="text-sm text-zinc-400 text-center mb-6">
                Send me anonymous tea. I read everything. I judge everything.
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/20 border border-pink-500/40 px-4 py-2">
                <Coffee className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-medium text-pink-400">
                  100% Anonymous
                </span>
              </div>
            </div>

            {/* Bottom watermark */}
            <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-sm px-4 py-3 flex items-center justify-center">
              <span className="text-sm font-semibold text-gradient">
                spillthetea.app/{username}
              </span>
            </div>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3.5 font-semibold text-white glow-pink disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Image
            </>
          )}
        </button>

        <p className="text-center text-xs text-zinc-600 mt-3">
          {inWebView
            ? 'Tip: Long-press the image to save it to your photos'
            : '9:16 aspect ratio — ready for Instagram Stories'}
        </p>
      </motion.div>
    </motion.div>
  );
}
