-- Clean up stuck online users and verify the fix
-- Run this in your Supabase SQL editor

-- First, let's see what stuck users we have
SELECT 
    user_id,
    display_name,
    last_seen,
    is_online,
    EXTRACT(EPOCH FROM (NOW() - last_seen))/60 as minutes_ago
FROM user_presence 
WHERE is_online = true 
AND last_seen < NOW() - INTERVAL '3 minutes';

-- Now let's mark them offline
UPDATE user_presence 
SET is_online = false 
WHERE is_online = true 
AND last_seen < NOW() - INTERVAL '3 minutes';

-- Verify the cleanup worked
SELECT 
    COUNT(*) as remaining_online_users
FROM user_presence 
WHERE is_online = true;

-- Show all current online users (should be recent)
SELECT 
    user_id,
    display_name,
    last_seen,
    EXTRACT(EPOCH FROM (NOW() - last_seen))/60 as minutes_ago
FROM user_presence 
WHERE is_online = true 
ORDER BY last_seen DESC;

-- Test the updated function
SELECT mark_inactive_users_offline();

-- Final verification - should be 0 stuck users
SELECT COUNT(*) as stuck_users
FROM user_presence 
WHERE is_online = true 
AND last_seen < NOW() - INTERVAL '3 minutes'; 