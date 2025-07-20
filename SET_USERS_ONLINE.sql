-- Set users online for testing green dot functionality
-- Run this in your Supabase SQL editor

-- First, let's see what users we have
SELECT 
    user_id,
    display_name,
    is_online,
    last_seen
FROM user_presence 
ORDER BY last_seen DESC;

-- Set all users as online for testing
UPDATE user_presence 
SET 
    is_online = true,
    last_seen = NOW()
WHERE is_online = false;

-- Verify the update worked
SELECT 
    user_id,
    display_name,
    is_online,
    last_seen
FROM user_presence 
ORDER BY last_seen DESC;

-- Count online users
SELECT 
    COUNT(*) as online_users_count,
    COUNT(CASE WHEN is_online = true THEN 1 END) as currently_online
FROM user_presence; 