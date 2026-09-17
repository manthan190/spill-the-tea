/*
# Spill The Tea — Full Schema

1. Purpose
   Anonymous messaging app where users claim a handle (e.g. /yourname),
   share their link, and receive anonymous messages ("tea"). Senders can
   optionally pay to pin their message (Express Tea) or unlock sender hints
   (device, location, full bundle).

2. New Tables
   - `profiles` — user profiles linked to auth.users. username is the public handle.
     Columns: id (uuid PK → auth.users), username (text unique), display_name (text),
     avatar_url (text), created_at (timestamptz).
   - `messages` — anonymous messages sent to a profile.
     Columns: id (uuid PK), recipient_id (uuid → profiles.id), content (text),
     is_priority (bool, default false), is_flagged (bool, default false),
     is_read (bool, default false), created_at (timestamptz).
   - `message_hints` — locked metadata about each message's sender.
     Columns: message_id (uuid PK → messages.id), device (text), browser (text),
     city (text), network (text), ig_first_letter (text),
     is_device_unlocked (bool default false), is_location_unlocked (bool default false),
     is_full_bundle_unlocked (bool default false).
   - `rate_limits` — IP-based rate limiting for the send endpoint (max 3 per 10 min).
     Columns: id (uuid PK), ip_address (text), created_at (timestamptz).
   - `payments` — Razorpay order + payment tracking for paywall unlocks.
     Columns: id (uuid PK), razorpay_order_id (text), razorpay_payment_id (text),
     razorpay_signature (text), message_id (uuid → messages.id), tier (text),
     amount (integer, paise), status (text default 'created'), created_at (timestamptz).

3. Security (RLS)
   - profiles: public SELECT (anyone can view a profile to send messages).
     Owner-scoped INSERT/UPDATE/DELETE for authenticated users.
   - messages: public INSERT (anonymous senders). Recipient-only SELECT/UPDATE/DELETE.
   - message_hints: recipient-only SELECT. No direct INSERT/UPDATE for anon or
     authenticated — only the service role (API routes) writes hints and unlocks them.
   - rate_limits: public INSERT + SELECT (API route checks counts). No UPDATE/DELETE
     for anon/authenticated; old rows cleaned via service role or TTL policy.
   - payments: recipient-only SELECT via message join. No direct INSERT/UPDATE for
     anon/authenticated — service role manages payment records.

4. Indexes
   - profiles.username (unique)
   - messages.recipient_id + created_at desc (inbox feed)
   - message_hints.message_id (unique via PK)
   - rate_limits.ip_address + created_at (rate limit query)
   - payments.message_id, payments.razorpay_order_id
*/

-- ============ profiles ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============ messages ============
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_priority boolean NOT NULL DEFAULT false,
  is_flagged boolean NOT NULL DEFAULT false,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can send a message to any recipient
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only the recipient can read their messages
DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = recipient_id);

-- Only the recipient can update their messages (mark read, flag, etc.)
DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
  TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);

-- Only the recipient can delete their messages
DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE
  TO authenticated USING (auth.uid() = recipient_id);

CREATE INDEX IF NOT EXISTS idx_messages_recipient_created
  ON messages (recipient_id, created_at DESC);

-- ============ message_hints ============
CREATE TABLE IF NOT EXISTS message_hints (
  message_id uuid PRIMARY KEY REFERENCES messages(id) ON DELETE CASCADE,
  device text,
  browser text,
  city text,
  network text,
  ig_first_letter text,
  is_device_unlocked boolean NOT NULL DEFAULT false,
  is_location_unlocked boolean NOT NULL DEFAULT false,
  is_full_bundle_unlocked boolean NOT NULL DEFAULT false
);

ALTER TABLE message_hints ENABLE ROW LEVEL SECURITY;

-- Only the recipient can read hints for their messages
DROP POLICY IF EXISTS "select_own_hints" ON message_hints;
CREATE POLICY "select_own_hints" ON message_hints FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_hints.message_id
      AND messages.recipient_id = auth.uid()
    )
  );

-- No INSERT / UPDATE / DELETE policies for anon or authenticated.
-- All writes go through the service role in API routes (bypasses RLS).

-- ============ rate_limits ============
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_rate_limits" ON rate_limits;
CREATE POLICY "anon_insert_rate_limits" ON rate_limits FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_rate_limits" ON rate_limits;
CREATE POLICY "anon_select_rate_limits" ON rate_limits FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_created
  ON rate_limits (ip_address, created_at DESC);

-- ============ payments ============
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  tier text NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Only the recipient of the linked message can read their payment records
DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = payments.message_id
      AND messages.recipient_id = auth.uid()
    )
  );

-- No INSERT / UPDATE / DELETE for anon or authenticated.
-- All writes go through the service role in API routes.

CREATE INDEX IF NOT EXISTS idx_payments_message_id ON payments (message_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (razorpay_order_id);

-- ============ Cleanup function for old rate_limit rows ============
-- Called by the service role periodically; safe no-op if nothing to delete.
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limits WHERE created_at < now() - interval '1 hour';
END;
$$;