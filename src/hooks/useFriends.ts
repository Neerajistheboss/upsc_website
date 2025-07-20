import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Friend, FriendRequest, SentFriendRequest } from '@/types/friends'

// Re-export types for convenience
export type { Friend, FriendRequest, SentFriendRequest }

export const useFriends = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch friends
  const fetchFriends = async () => {
    let friends: Friend[] = []
    console.log('Fetching friends for user:', user?.id)
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .rpc('get_user_friends', { user_uuid: user.id })

      if (error) throw error
      friends = data as Friend[]
    } catch (err) {
      console.error('Error fetching friends:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch friends')
    } finally {

      setLoading(false)
      return friends
    }
  }

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    let friendRequests: FriendRequest[] = []
    if (!user) return

    try {
      const { data, error } = await supabase
        .rpc('get_user_friend_requests', { user_uuid: user.id })

      if (error) throw error
      
      friendRequests = data as FriendRequest[]
    } catch (err) {
      console.error('Error fetching friend requests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch friend requests')
    }
    return friendRequests
  }

  // Fetch sent friend requests
  const fetchSentRequests = async () => {
    let sentRequests: SentFriendRequest[] = []
    if (!user) return

    try {
      const { data, error } = await supabase
        .rpc('get_sent_friend_requests', { user_uuid: user.id })

      if (error) throw error
      sentRequests = data as SentFriendRequest[]
    } catch (err) {
      console.error('Error fetching sent requests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch sent requests')
    }
    return sentRequests
  }

  // Send friend request
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

  // Accept friend request
  const acceptFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('receiver_id', user.id)

      if (error) throw error

      // Refresh data
      await Promise.all([
        fetchFriends(),
        fetchFriendRequests(),
        fetchSentRequests()
      ])

      return { success: true }
    } catch (err) {
      console.error('Error accepting friend request:', err)
      throw err
    }
  }

  // Reject friend request
  const rejectFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('receiver_id', user.id)

      if (error) throw error

      // Refresh friend requests
      await fetchFriendRequests()
      return { success: true }
    } catch (err) {
      console.error('Error rejecting friend request:', err)
      throw err
    }
  }

  // Cancel sent friend request
  const cancelFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('sender_id', user.id)

      if (error) throw error

      // Refresh sent requests
      await fetchSentRequests()
      return { success: true }
    } catch (err) {
      console.error('Error cancelling friend request:', err)
      throw err
    }
  }

  // Remove friend
  const removeFriend = async (friendId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Remove both directions of the friendship
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`)

      if (error) throw error

      // Refresh friends list
      await fetchFriends()
      return { success: true }
    } catch (err) {
      console.error('Error removing friend:', err)
      throw err
    }
  }

  // Check if users are friends
  const checkFriendship = async (otherUserId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .rpc('are_users_friends', { 
          user1_uuid: user.id, 
          user2_uuid: otherUserId 
        })

      if (error) throw error
      return data || false
    } catch (err) {
      console.error('Error checking friendship:', err)
      return false
    }
  }

  // Check friend request status
  const checkFriendRequestStatus = async (otherUserId: string): Promise<string> => {
    if (!user) return 'none'

    try {
      const { data, error } = await supabase
        .rpc('get_friend_request_status', { 
          user1_uuid: user.id, 
          user2_uuid: otherUserId 
        })

      if (error) throw error
      return data || 'none'
    } catch (err) {
      console.error('Error checking friend request status:', err)
      return 'none'
    }
  }

  // Initial load
  useEffect(() => {
    console.log('useEffect called')
    if (!user?.id) return

    const loadAllData = async () => {
      // Prevent multiple simultaneous loads
      
      console.log('Loading friends data for user:', user.id)
      
      try {
        setLoading(true)
        setError(null) // Clear any previous errors
        await Promise.all([
          fetchFriends(),
          fetchFriendRequests(),
          fetchSentRequests()
        ])
        console.log('Friends data loaded successfully')
      } catch (err) {
        console.error('Error loading friends data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load friends data')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [user?.id]) // Only depend on user.id, not the entire user object

  // Refresh data function
  const refreshData = async () => {
    if (!user) return

    try {
      setLoading(true)
      await Promise.all([
        fetchFriends(),
        fetchFriendRequests(),
        fetchSentRequests()
      ])
    } catch (err) {
      console.error('Error refreshing friends data:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh friends data')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    checkFriendship,
    checkFriendRequestStatus,
    refreshData,
    fetchFriends,
    fetchFriendRequests,
    fetchSentRequests
  }
} 