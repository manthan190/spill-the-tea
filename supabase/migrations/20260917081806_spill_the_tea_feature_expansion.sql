/*
# Spill The Tea — Feature Expansion Migration

1. New Tables
   - `crush_list`: Tracks who added a profile to their "crush list" for the Secret Flame counter.
     Columns: id (uuid PK), profile_id (uuid → profiles), ip_address (text), created_at (timestamptz).
     Unique constraint on (profile_id, ip_address) to prevent duplicate crush adds.
   - `blocked_ips`: IP blocklist for harassment prevention.
     Columns: id (uuid PK), profile_id (uuid → profiles), ip_address (text), created_at (timestamptz).
     Unique constraint on (profile_id, ip_address).
   - `voice_notes`: Stores voice tea recordings (base64 audio data).
     Columns: id (uuid PK), message_id (uuid → messages), audio_data (text), duration_seconds (integer),
     is_voice_unlocked (boolean default false), created_at (timestamptz).

2. Modified Tables
   - `message_hints`: Added `sender_ip` (text) column to enable IP-based blocking.
   - `messages`: Added `has_voice` (boolean default false) to flag voice tea messages.
   - `payments`: Added `processed_at` (timestamptz) column for webhook idempotency tracking.

3. Security
   - crush_list: public INSERT (anyone can add a crush), public SELECT count only (via service role).
     RLS: anon+authenticated can insert; no direct SELECT (service role only for counting).
   - blocked_ips: owner-scoped CRUD (profile owner manages their blocklist).
   - voice_notes: recipient-only SELECT. No direct INSERT/UPDATE for anon — service role manages.
   - message_hints.sender_ip: only writable by service role (never exposed to clients).

4. Idempotency
   - payments.processed_at: when non-null, the webhook has already been processed.
     The webhook handler checks this before performing unlocks, preventing duplicate execution.
*/

-- ============ crush_list ============
CREATE TABLE IF NOT EXISTS crush_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crush_list ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_crush_list_profile_ip
  ON crush_list (profile_id, ip_address);

DROP POLICY IF EXISTS "anon_insert_crush_list" ON crush_list;
CREATE POLICY "anon_insert_crush_list" ON crush_list FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- No SELECT policy: only service role can read (for counting)

-- ============ blocked_ips ============
CREATE TABLE IF NOT EXISTS blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_ips_profile_ip
  ON blocked_ips (profile_id, ip_address);

DROP POLICY IF EXISTS "select_own_blocked_ips" ON blocked_ips;
CREATE POLICY "select_own_blocked_ips" ON blocked_ips FOR SELECT
  TO authenticated USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "insert_own_blocked_ips" ON blocked_ips;
CREATE POLICY "insert_own_blocked_ips" ON blocked_ips FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "delete_own_blocked_ips" ON blocked_ips;
CREATE POLICY "delete_own_blocked_ips" ON blocked_ips FOR DELETE
  TO authenticated USING (auth.uid() = profile_id);

-- ============ voice_notes ============
CREATE TABLE IF NOT EXISTS voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  audio_data text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 10,
  is_voice_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;

-- Only the recipient can read voice notes for their messages
DROP POLICY IF EXISTS "select_own_voice_notes" ON voice_notes;
CREATE POLICY "select_own_voice_notes" ON voice_notes FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = voice_notes.message_id
      AND messages.recipient_id = auth.uid()
    )
  );

-- No INSERT / UPDATE for anon or authenticated — service role manages

-- ============ Add columns to existing tables ============

-- Add sender_ip to message_hints (for IP blocking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'message_hints' AND column_name = 'sender_ip'
  ) THEN
    ALTER TABLE message_hints ADD COLUMN sender_ip text;
  END IF;
END $$;

-- Add has_voice to messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'has_voice'
  ) THEN
    ALTER TABLE messages ADD COLUMN has_voice boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add processed_at to payments (for webhook idempotency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'processed_at'
  ) THEN
    ALTER TABLE payments ADD COLUMN processed_at timestamptz;
  END IF;
END $$;

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_crush_list_profile ON crush_list (profile_id);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_profile ON blocked_ips (profile_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_message ON voice_notes (message_id);