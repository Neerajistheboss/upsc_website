-- Debug user ID matching between public_profiles and user_presence
-- Run this in your Supabase SQL editor

-- Check public profiles
SELECT 
    id as profile_id,
    display_name,
    email,
    created_at
FROM public_profiles 
ORDER BY created_at DESC;

-- Check user presence
SELECT 
    user_id as presence_user_id,
    display_name,
    is_online,
    last_seen
FROM user_presence 
ORDER BY last_seen DESC;

-- Check auth.users to see the actual user IDs
SELECT 
    id as auth_user_id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- Check if there are any matches between public_profiles and user_presence
SELECT 
    pp.id as profile_id,
    pp.display_name as profile_name,
    pp.email as profile_email,
    up.user_id as presence_user_id,
    up.display_name as presence_name,
    up.is_online,
    up.last_seen,
    CASE 
        WHEN pp.id = up.user_id THEN 'MATCH'
        ELSE 'NO MATCH'
    END as match_status
FROM public_profiles pp
LEFT JOIN user_presence up ON pp.id = up.user_id
ORDER BY pp.created_at DESC; 