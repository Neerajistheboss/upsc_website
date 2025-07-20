-- Update presence timeout for faster offline detection
-- Run this in your Supabase SQL editor

-- Update the function to mark users offline after 2 minutes (instead of 5)
CREATE OR REPLACE FUNCTION mark_inactive_users_offline()
RETURNS void AS $$
BEGIN
    UPDATE public.user_presence 
    SET is_online = false 
    WHERE is_online = true 
    AND last_seen < NOW() - INTERVAL '2 minutes';
END;
$$ LANGUAGE plpgsql;

-- Test the function (optional)
-- SELECT mark_inactive_users_offline();

-- Check current online users (for verification)
-- SELECT COUNT(*) as online_users FROM user_presence WHERE is_online = true;

-- Check for any stuck online users (should be 0 after running the function)
-- SELECT * FROM user_presence 
-- WHERE is_online = true 
-- AND last_seen < NOW() - INTERVAL '3 minutes'; 