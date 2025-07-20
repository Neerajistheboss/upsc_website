-- Update timeout to 1 minute for faster offline detection
-- Run this in your Supabase SQL editor

-- Update the function to mark users offline after 1 minute (instead of 2)
CREATE OR REPLACE FUNCTION mark_inactive_users_offline()
RETURNS void AS $$
BEGIN
    UPDATE public.user_presence 
    SET is_online = false 
    WHERE is_online = true 
    AND last_seen < NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT mark_inactive_users_offline();

-- Check current online users
SELECT 
    user_id,
    display_name,
    is_online,
    last_seen,
    EXTRACT(EPOCH FROM (NOW() - last_seen))/60 as minutes_ago
FROM user_presence 
WHERE is_online = true 
ORDER BY last_seen DESC;

-- Check for any stuck users (should be 0 after running the function)
SELECT COUNT(*) as stuck_users
FROM user_presence 
WHERE is_online = true 
AND last_seen < NOW() - INTERVAL '2 minutes'; 