# User Presence System Setup

This guide explains how to set up the real-time user presence system for the UPSC community.

## Overview

The presence system allows users to see who is currently online in the community in real-time. It includes:

- Real-time online/offline status
- Last seen timestamps
- Automatic cleanup of old records
- Heartbeat system to keep users online

## Database Setup

### 1. Run the SQL Script

Execute the `CREATE_USER_PRESENCE_TABLE.sql` script in your Supabase SQL editor:

```sql
-- This will create the user_presence table with all necessary policies
-- and enable real-time functionality
```

### 2. Enable Real-time

Make sure real-time is enabled for the `user_presence` table in your Supabase dashboard:

1. Go to Database → Replication
2. Ensure `user_presence` is in the list of tables with real-time enabled

## Features

### Real-time Online Status

- Users automatically appear online when they visit the community page
- Status updates in real-time across all connected users
- Online indicator shows green pulsing dot
- Offline users show gray dot with "last seen" timestamp

### Automatic Cleanup

The system includes automatic cleanup functions:

- **Inactive users**: Automatically marked offline after 5 minutes of inactivity
- **Old records**: Cleaned up after 24 hours (optional, requires pg_cron extension)

### Heartbeat System

- Users send heartbeat every 30 seconds to maintain online status
- Handles page visibility changes (tab switching)
- Properly marks users offline when they close the browser

## Implementation Details

### usePresence Hook

The `usePresence` hook manages:

- User's own online status
- Real-time subscription to other users' status
- Automatic heartbeat and cleanup
- Browser event handling

### PublicProfileCard Component

Updated to show:

- Real online status with animated indicator
- Last seen timestamp for offline users
- Proper styling for online/offline states

### CommunityPage

Enhanced with:

- Real-time online user count
- Integration with presence system
- Live community indicator

## Usage

### For Users

1. **Anonymous Users**: Can view online status of community members without logging in
2. **Logged-in Users**: Automatically appear online when they visit the community
3. **Real-time**: See other users' online status update instantly
4. **Accurate**: Status reflects actual activity (tab switching, browser closing)

### For Developers

```typescript
// Use the presence hook in any component
const { onlineUsers, isOnline, setOnline, setOffline } = usePresence()

// Check if a specific user is online
const isUserOnline = onlineUsers.find(u => u.user_id === userId)?.is_online

// Get online user count
const onlineCount = onlineUsers.length
```

## Security

### Row Level Security (RLS)

The system includes proper RLS policies:

- Anyone (including anonymous users) can read online users (for community display)
- Only logged-in users can update their own presence
- Only logged-in users can insert/delete their own presence

### Data Privacy

- Only online status and last seen time are shared
- No sensitive user data is exposed
- Automatic cleanup prevents data accumulation

## Monitoring

### Database Queries

Monitor the `user_presence` table:

```sql
-- Check current online users
SELECT * FROM user_presence WHERE is_online = true;

-- Check recent activity
SELECT * FROM user_presence ORDER BY last_seen DESC LIMIT 10;
```

### Performance

- Indexes on `user_id`, `is_online`, and `last_seen` for optimal performance
- Real-time subscriptions are efficient and scalable
- Automatic cleanup prevents table bloat

## Troubleshooting

### Common Issues

1. **Users not showing as online**
   - Check if real-time is enabled for the table
   - Verify RLS policies are correct
   - Check browser console for errors

2. **Status not updating in real-time**
   - Ensure Supabase real-time is properly configured
   - Check network connectivity
   - Verify subscription is active

3. **Performance issues**
   - Monitor table size and cleanup functions
   - Check for excessive heartbeat frequency
   - Review real-time subscription limits

### Debug Mode

Enable debug logging in the `usePresence` hook:

```typescript
// Add console.log statements to track presence updates
console.log('Presence update:', payload)
```

## Future Enhancements

Potential improvements:

1. **Typing indicators**: Show when users are typing
2. **Activity status**: Show what users are doing (viewing profiles, etc.)
3. **Presence history**: Track user activity patterns
4. **Custom status**: Allow users to set custom status messages
5. **Do not disturb**: Allow users to appear offline while still using the app

## Support

For issues or questions:

1. Check the browser console for errors
2. Verify database setup and policies
3. Test real-time functionality in Supabase dashboard
4. Review network connectivity and Supabase configuration 