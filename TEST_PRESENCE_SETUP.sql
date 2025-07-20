-- Quick test to check if user_presence table exists
-- Run this in your Supabase SQL editor

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'user_presence'
);

-- If the above returns false, run the full setup:
-- Copy and paste the contents of CREATE_USER_PRESENCE_TABLE.sql here

-- Test insert (this will fail if table doesn't exist or RLS is blocking)
-- INSERT INTO user_presence (user_id, is_online, last_seen) 
-- VALUES ('00000000-0000-0000-0000-000000000000', true, NOW())
-- ON CONFLICT (user_id) DO UPDATE SET 
--   is_online = EXCLUDED.is_online,
--   last_seen = EXCLUDED.last_seen;

-- Check current online users
-- SELECT * FROM user_presence WHERE is_online = true; 