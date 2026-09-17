export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  recipient_id: string;
  content: string;
  is_priority: boolean;
  is_flagged: boolean;
  is_read: boolean;
  has_voice: boolean;
  created_at: string;
};

export type MessageHint = {
  message_id: string;
  device: string | null;
  browser: string | null;
  city: string | null;
  network: string | null;
  ig_first_letter: string | null;
  sender_ip: string | null;
  is_device_unlocked: boolean;
  is_location_unlocked: boolean;
  is_full_bundle_unlocked: boolean;
};

export type Payment = {
  id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  message_id: string | null;
  tier: string;
  amount: number;
  status: string;
  processed_at: string | null;
  created_at: string;
};

export type VoiceNote = {
  id: string;
  message_id: string;
  audio_data: string;
  duration_seconds: number;
  is_voice_unlocked: boolean;
  created_at: string;
};

export type CrushListEntry = {
  id: string;
  profile_id: string;
  ip_address: string;
  created_at: string;
};

export type BlockedIP = {
  id: string;
  profile_id: string;
  ip_address: string;
  created_at: string;
};

export type MessageWithHints = Message & {
  message_hints: MessageHint | null;
  voice_notes: VoiceNote[] | null;
};

export const PAYWALL_TIERS = {
  express: { amount: 900, label: 'Express Tea (Priority Pin)', description: 'Pin at top with golden badge' },
  device: { amount: 1900, label: 'Device & Browser Hint', description: 'Unlock sender device + browser' },
  location: { amount: 3500, label: 'City & Network Location Hint', description: 'Unlock sender city + network' },
  bundle: { amount: 4900, label: 'Complete Sender Hints Bundle', description: 'Unlock all hints + IG first letter' },
  voice: { amount: 2900, label: 'Unlock Voice Tea', description: 'Unlock pitch-shifted voice note playback' },
} as const;

export type PaywallTier = keyof typeof PAYWALL_TIERS;
