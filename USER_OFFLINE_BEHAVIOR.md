# How Users Go Offline

## Overview

The presence system automatically detects when users go offline through multiple mechanisms, ensuring accurate online status in real-time.

## 🔄 Automatic Offline Detection

### 1. **Browser/Tab Closing**
```typescript
const handleBeforeUnload = () => {
  updatePresence(false)  // User goes offline immediately
}
```
- **Trigger**: User closes browser tab/window
- **Action**: Immediate offline status update
- **Real-time**: Other users see status change instantly

### 2. **Tab Switching (Page Visibility)**
```typescript
const handleVisibilityChange = () => {
  if (document.hidden) {
    setOffline()  // User goes offline when tab is hidden
  } else {
    setOnline()   // User comes back online when tab is active
  }
}
```
- **Trigger**: User switches to another tab or minimizes browser
- **Action**: User appears offline to others
- **Return**: User appears online when returning to tab

### 3. **Heartbeat Timeout (5 minutes)**
```sql
-- Database function that runs every 2 minutes
CREATE OR REPLACE FUNCTION mark_inactive_users_offline()
RETURNS void AS $$
BEGIN
    UPDATE public.user_presence 
    SET is_online = false 
    WHERE is_online = true 
    AND last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;
```
- **Trigger**: No heartbeat for 5+ minutes
- **Action**: Automatic offline marking
- **Safety**: Catches users who don't properly close browser

### 4. **Component Unmount**
```typescript
return () => {
  clearInterval(heartbeat)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  presenceChannel.unsubscribe()
  setOffline()  // User goes offline when leaving community page
}
```
- **Trigger**: User navigates away from community page
- **Action**: Immediate offline status
- **Cleanup**: Proper event listener removal

## ⏰ Timing Breakdown

| Event | Time to Offline | Description |
|-------|----------------|-------------|
| **Browser Close** | Immediate | User closes tab/window |
| **Tab Switch** | Immediate | User switches to other tab |
| **Page Navigation** | Immediate | User leaves community page |
| **Heartbeat Timeout** | 5 minutes | No activity detected |
| **Network Issues** | 5 minutes | Connection problems |

## 🔧 Heartbeat System

### How It Works
```typescript
// Heartbeat sends update every 30 seconds
const heartbeat = setInterval(() => {
  updatePresence(true)  // "I'm still here!"
}, 30000)
```

### Purpose
- **Keeps users online** while actively using the app
- **Detects inactivity** when heartbeat stops
- **Handles network issues** gracefully
- **Prevents false offline** status

## 🛡️ Database Cleanup

### Automatic Cleanup Functions

1. **Mark Inactive Users Offline** (Every 2 minutes)
```sql
-- Marks users offline if no heartbeat for 5+ minutes
SELECT mark_inactive_users_offline();
```

2. **Clean Old Records** (Every 6 hours)
```sql
-- Removes offline records older than 24 hours
SELECT cleanup_old_presence();
```

## 📱 User Experience

### What Users See

**Online Status:**
- 🟢 Green pulsing dot
- "X online now" count
- Real-time updates

**Offline Status:**
- ⚫ Gray dot
- "Last seen X minutes ago"
- Accurate timestamps

### Visual Indicators

```typescript
// Online indicator with animation
<div className={`w-4 h-4 border-2 border-background rounded-full ${
  isOnline 
    ? 'bg-green-500 animate-pulse' 
    : 'bg-gray-400'
}`} />

// Last seen timestamp
{!isOnline && lastSeen && (
  <div className="text-xs text-muted-foreground">
    {getTimeAgo(lastSeen)}  // "2m ago", "1h ago", etc.
  </div>
)}
```

## 🔍 Debugging Offline Issues

### Common Scenarios

1. **User Still Shows Online After Closing**
   - Check if `beforeunload` event fired
   - Verify database update was successful
   - Wait for 5-minute timeout

2. **User Shows Offline While Active**
   - Check network connectivity
   - Verify heartbeat is running
   - Check browser console for errors

3. **Delayed Status Updates**
   - Check real-time subscription status
   - Verify Supabase connection
   - Check for rate limiting

### Debug Logs
```typescript
console.log('Updating presence for user:', user.id, 'isOnline:', isOnline)
console.log('Presence update received:', payload)
console.log('Presence subscription status:', status)
```

## 🎯 Best Practices

### For Users
- **Close browser properly** for immediate offline status
- **Stay on community page** to remain online
- **Check network** if status seems incorrect

### For Developers
- **Monitor heartbeat frequency** (30 seconds is optimal)
- **Test offline scenarios** thoroughly
- **Handle network disconnections** gracefully
- **Clean up old records** regularly

## 🔄 Manual Offline Control

### Programmatic Control
```typescript
const { setOffline, setOnline } = usePublicPresence()

// Manually go offline
setOffline()

// Manually go online
setOnline()
```

### Future Enhancements
- **"Do Not Disturb" mode**: Appear offline while using app
- **Custom status messages**: "Busy studying", "Available for chat"
- **Scheduled offline**: Set times to automatically go offline
- **Manual timeout**: User-set inactivity timeout

## 📊 Monitoring

### Database Queries
```sql
-- Check current online users
SELECT * FROM user_presence WHERE is_online = true;

-- Check recent activity
SELECT * FROM user_presence ORDER BY last_seen DESC LIMIT 10;

-- Check for stuck online users
SELECT * FROM user_presence 
WHERE is_online = true 
AND last_seen < NOW() - INTERVAL '10 minutes';
```

The system ensures accurate online/offline status through multiple detection mechanisms, providing a reliable and responsive community experience! 🎉 