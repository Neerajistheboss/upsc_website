# Quick Database Setup for Friends System

## 🚨 Current Issue
Friend requests show success toast but don't actually get saved because the database isn't set up yet.

## ✅ Quick Fix (5 minutes)

### **Step 1: Go to Supabase Dashboard**
1. Open your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar

### **Step 2: Run the Friends System SQL**
1. Copy the entire content from `CREATE_FRIENDS_SYSTEM.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** button

### **Step 3: Re-enable Database Operations**
Open `src/hooks/useFriends.ts` and replace the temporary code with real database operations:

#### **Replace the sendFriendRequest function:**
```typescript
// Find this (around line 70):
const sendFriendRequest = async (receiverId: string, message?: string) => {
  if (!user) throw new Error('User not authenticated')

  try {
    // Temporary: Show success message until database tables are set up
    // const { error } = await supabase
    //   .from('friend_requests')
    //   .insert({
    //     sender_id: user.id,
    //     receiver_id: receiverId,
    //     message: message || 'Hey! Would love to connect and study together!'
    //   })
    // if (error) throw error
    // await fetchSentRequests()
    
    console.log('Friend request would be sent:', { receiverId, message })
    return { success: true }
  } catch (err) {
    console.error('Error sending friend request:', err)
    throw err
  }
}

// Replace with this:
const sendFriendRequest = async (receiverId: string, message?: string) => {
  if (!user) throw new Error('User not authenticated')

  try {
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: message || 'Hey! Would love to connect and study together!'
      })

    if (error) throw error

    // Refresh sent requests
    await fetchSentRequests()
    return { success: true }
  } catch (err) {
    console.error('Error sending friend request:', err)
    throw err
  }
}
```

#### **Replace the fetch functions:**
```typescript
// Find this (around line 20):
const fetchFriends = async () => {
  if (!user) return

  try {
    setLoading(true)
    // Temporary: Return empty array until database functions are set up
    // const { data, error } = await supabase
    //   .rpc('get_user_friends', { user_uuid: user.id })
    // if (error) throw error
    // setFriends(data || [])
    setFriends([])
  } catch (err) {
    console.error('Error fetching friends:', err)
    setError(err instanceof Error ? err.message : 'Failed to fetch friends')
  } finally {
    setLoading(false)
  }
}

// Replace with this:
const fetchFriends = async () => {
  if (!user) return

  try {
    setLoading(true)
    const { data, error } = await supabase
      .rpc('get_user_friends', { user_uuid: user.id })

    if (error) throw error
    setFriends(data || [])
  } catch (err) {
    console.error('Error fetching friends:', err)
    setError(err instanceof Error ? err.message : 'Failed to fetch friends')
  } finally {
    setLoading(false)
  }
}
```

### **Step 4: Test It**
1. Create two user accounts
2. Log in with one account
3. Go to Community page
4. Click "Connect" on another user's profile
5. Check the Friends tab → Sent requests
6. Log in with the other account
7. Check Friends tab → Requests (should see the incoming request)

## 🎯 What This Creates

- **`friend_requests`** table - Stores all friend requests
- **`friends`** table - Stores accepted friendships  
- **Database functions** - `get_user_friends`, `get_user_friend_requests`, etc.
- **Security policies** - Users can only see their own data
- **Automatic triggers** - Creates friendships when requests are accepted

## 🎉 Result

After this setup:
- ✅ Friend requests actually get saved to database
- ✅ You can see sent requests in Friends tab
- ✅ Other users can see incoming requests
- ✅ Accept/reject functionality works
- ✅ Friends list shows actual connections

The system will work exactly as expected! 🚀 