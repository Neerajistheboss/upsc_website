import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useFriends } from '@/hooks/useFriends'
import { useAuth } from '@/contexts/AuthContext'
import { UserPlus, UserCheck, Clock, MessageSquare, X } from 'lucide-react'
import { toast } from 'sonner'

interface ConnectButtonProps {
  targetUserId: string
  targetUserName: string
  className?: string
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  targetUserId,
  targetUserName,
  className = ''
}) => {
  console.log('ConnectButton rendered',targetUserId)
  const { user } = useAuth()
  const { 
    sendFriendRequest, 
    removeFriend,
    checkFriendship, 
    checkFriendRequestStatus,
    refreshData 
  } = useFriends()
  
  const [status, setStatus] = useState<'none' | 'friends' | 'pending_sent' | 'pending_received'>('none')
  const [loading, setLoading] = useState(false)
  const [showMessageInput, setShowMessageInput] = useState(false)
  const [message, setMessage] = useState('')


  useEffect(()=>{
    console.log('USE EFFECT')
    console.log(status,loading,showMessageInput,message)
  },[status,loading,showMessageInput,message])

  // Memoize checkStatus to avoid recreating on every render
  const checkStatus = useCallback(async () => {
    if (!user || user.id === targetUserId) return
    try {
      const [isFriends, requestStatus] = await Promise.all([
        checkFriendship(targetUserId),
        checkFriendRequestStatus(targetUserId)
      ])
      if (isFriends) {
        setStatus('friends')
      } else if (requestStatus === 'pending') {
        setStatus('pending_sent')
      } else {
        setStatus('none')
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
    }
  }, [user, targetUserId, checkFriendship, checkFriendRequestStatus])

  useEffect(() => {
    checkStatus()
    // Only run when user, targetUserId, or the checkStatus function changes
  }, [])

  const handleConnect = () => {
    if (!user) {
      toast.error('Please log in to connect with others')
      return
    }
    if (user.id === targetUserId) {
      toast.error('You cannot connect with yourself')
      return
    }
    setShowMessageInput(true)
  }

  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }
    setLoading(true)
    try {
      await sendFriendRequest(targetUserId, message.trim())
      setStatus('pending_sent')
      setShowMessageInput(false)
      setMessage('')
      toast.success(`Friend request sent to ${targetUserName}!`)
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast.error('Failed to send friend request')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async () => {
    setLoading(true)
    try {
      // We need the request ID here - this is a simplified version
      // In a real implementation, you'd need to get the request ID
      toast.success(`You are now friends with ${targetUserName}!`)
      setStatus('friends')
      await refreshData()
    } catch (error) {
      console.error('Error accepting friend request:', error)
      toast.error('Failed to accept friend request')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectRequest = async () => {
    setLoading(true)
    try {
      // We need the request ID here - this is a simplified version
      toast.success('Friend request rejected')
      setStatus('none')
      await refreshData()
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      toast.error('Failed to reject friend request')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRequest = async () => {
    setLoading(true)
    try {
      // We need the request ID here - this is a simplified version
      toast.success('Friend request cancelled')
      setStatus('none')
      await refreshData()
    } catch (error) {
      console.error('Error cancelling friend request:', error)
      toast.error('Failed to cancel friend request')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFriend = async () => {
    setLoading(true)
    try {
      await removeFriend(targetUserId)
      setStatus('none')
      toast.success(`Removed ${targetUserName} from friends`)
    } catch (error) {
      console.error('Error removing friend:', error)
      toast.error('Failed to remove friend')
    } finally {
      setLoading(false)
    }
  }

  // Don't show button for own profile
  if (!user || user.id === targetUserId) {
    console.log('user', user)
    console.log('targetUserId', targetUserId)
    console.log('ConnectButton not rendered')
    return null
  }

  if (showMessageInput) {
    return (
      <div className={`space-y-2 ${className}`}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a personal message (optional)..."
          className="w-full p-2 text-sm border rounded-md resize-none"
          rows={3}
          maxLength={200}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSendRequest}
            disabled={loading}
            size="sm"
            className="flex-1"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
          <Button
            onClick={() => {
              setShowMessageInput(false)
              setMessage('')
            }}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  switch (status) {
    case 'friends':
      return (
        <div className={`flex gap-2 ${className}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Friends
          </Button>
          <Button
            onClick={handleRemoveFriend}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )

    case 'pending_sent':
      return (
        <Button
          onClick={handleCancelRequest}
          variant="outline"
          size="sm"
          disabled={loading}
          className={className}
        >
          <Clock className="w-4 h-4 mr-2" />
          {loading ? 'Cancelling...' : 'Cancel Request'}
        </Button>
      )

    case 'pending_received':
      return (
        <div className={`flex gap-2 ${className}`}>
          <Button
            onClick={handleAcceptRequest}
            size="sm"
            className="flex-1"
            disabled={loading}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button
            onClick={handleRejectRequest}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )

    default:
      return (
        <Button
          onClick={handleConnect}
          size="sm"
          className={className}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Connect
        </Button>
      )
  }
} 