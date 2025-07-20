-- Debug online status and user ID matching
-- Run this in your Supabase SQL editor

-- Check public profiles
SELECT 
    id as profile_id,
    display_name,
    email,
    created_at
FROM public_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Check user presence
SELECT 
    user_id as presence_user_id,
    display_name,
    is_online,
    last_seen
FROM user_presence 
ORDER BY last_seen DESC 
LIMIT 5;

-- Check if there are any matches
SELECT 
    pp.id as profile_id,
    pp.display_name as profile_name,
    up.user_id as presence_user_id,
    up.display_name as presence_name,
    up.is_online,
    up.last_seen
FROM public_profiles pp
LEFT JOIN user_presence up ON pp.id = up.user_id
ORDER BY pp.created_at DESC;

-- Check auth.users to see the actual user IDs
SELECT 
    id as auth_user_id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5; 