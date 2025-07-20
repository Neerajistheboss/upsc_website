# Presence System Troubleshooting

## Issue: Green dot not showing when user is online

### Quick Fix (Temporary)

I've created a temporary fallback system that will show online status immediately. The app is now using `useSimplePresence` instead of `usePresence` which will show green dots for testing.

### Debug Steps

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for console logs showing:
     - "CommunityPage - users: X"
     - "CommunityPage - onlineUsers: [...]"
     - "PublicProfileCard props: {...}"

2. **Verify Database Setup**
   - Run the test query in Supabase SQL Editor:
   ```sql
   SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_presence'
   );
   ```

3. **If Table Doesn't Exist**
   - Run the full `CREATE_USER_PRESENCE_TABLE.sql` script
   - Enable real-time for the table in Supabase Dashboard

### Current Status

✅ **Temporary Fix Applied**: Using `useSimplePresence` hook
- Shows green dots for current user and mock users
- Works immediately without database setup
- Good for testing the UI

### To Enable Full Real-time Presence

1. **Set up the database table**:
   ```sql
   -- Run CREATE_USER_PRESENCE_TABLE.sql in Supabase
   ```

2. **Switch back to real presence**:
   ```typescript
   // In CommunityPage.tsx, change:
   import { useSimplePresence } from '@/hooks/useSimplePresence'
   // to:
   import { usePresence } from '@/hooks/usePresence'
   
   // And change:
   const { onlineUsers } = useSimplePresence()
   // to:
   const { onlineUsers } = usePresence()
   ```

3. **Remove debug logs** (optional):
   - Remove console.log statements from the files

### Expected Behavior

With the temporary fix:
- ✅ Current user shows green dot
- ✅ Mock users show green dots
- ✅ Online count shows correctly
- ✅ "Last seen" shows for offline users

With full setup:
- ✅ Real-time updates across all users
- ✅ Proper online/offline detection
- ✅ Heartbeat system
- ✅ Automatic cleanup

### Common Issues

1. **Table doesn't exist**: Run the SQL setup script
2. **RLS policies blocking**: Check Supabase policies
3. **Real-time not enabled**: Enable in Supabase Dashboard
4. **User not authenticated**: Ensure user is logged in

### Testing

1. Visit the community page
2. Check browser console for debug logs
3. Verify green dots are showing
4. Check online count in the header

The temporary system should work immediately and show you how the online indicators will look once the full system is set up. 