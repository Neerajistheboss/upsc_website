import React, { useEffect, useState } from 'react'
import { useFriends } from '@/hooks/useFriends'
import type { Friend, FriendRequest, SentFriendRequest } from '@/types/friends'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, UserPlus, UserCheck, Clock, MessageSquare, X, Users, Inbox, Send } from 'lucide-react'
import { toast } from 'sonner'
import GoogleLoginButton from './GoogleLoginButton'

interface FriendsTabProps {
  className?: string
}

export const FriendsTab: React.FC<FriendsTabProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<SentFriendRequest[]>([])
  const {  
    loading, 
    error,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    fetchFriends,
    fetchFriendRequests,
    fetchSentRequests
  } = useFriends()

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'sent'>('friends')
  useEffect(() => {
    if (activeTab === 'friends') {
      const fetchFriendsData = async () => {
        const friendsData = await fetchFriends()
        setFriends(friendsData as Friend[])
      }
      fetchFriendsData()
    }
    if (activeTab === 'requests') {
      const fetchFriendRequestsData = async () => {
        const friendRequestsData = await fetchFriendRequests()
        setFriendRequests(friendRequestsData as FriendRequest[])
      }
      fetchFriendRequestsData()
    }
    if (activeTab === 'sent') {
      const fetchSentRequestsData = async () => {
        const sentRequestsData = await fetchSentRequests()
        setSentRequests(sentRequestsData as SentFriendRequest[])
      }
      fetchSentRequestsData()
    }
  }, [activeTab])



  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sign in to see your friends</h3>
        <p className="text-muted-foreground">Connect with fellow UPSC aspirants and build your study network.</p>
        <div className='w-fit mx-auto my-4'>
          <GoogleLoginButton loginText='Sign in with Google'/> 
        </div>
      </div>
    )
  }

  // if (loading) {
  //   return (
  //     <div className={`text-center py-8 ${className}`}>
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
  //       <p className="text-muted-foreground">Loading your connections...</p>
  //     </div>
  //   )
  // }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <X className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error loading friends</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  const handleAcceptRequest = async (requestId: string, senderName: string) => {
    try {
      await acceptFriendRequest(requestId)
      toast.success(`You are now friends with ${senderName}!`)
    } catch (error) {
      toast.error('Failed to accept friend request')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId)
      toast.success('Friend request rejected')
    } catch (error) {
      toast.error('Failed to reject friend request')
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId)
      toast.success('Friend request cancelled')
    } catch (error) {
      toast.error('Failed to cancel friend request')
    }
  }

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    try {
      await removeFriend(friendId)
      toast.success(`Removed ${friendName} from friends`)
    } catch (error) {
      toast.error('Failed to remove friend')
    }
  }

  const renderFriendCard = (friend: Friend) => (
    <div key={friend.friend_id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-0.5">
          {friend.photo_url ? (
            <img 
              src={friend.photo_url} 
              alt={friend.display_name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{friend.display_name}</h4>
          <p className="text-sm text-muted-foreground truncate">{friend.email}</p>
          {friend.expert_subject && (
            <Badge variant="secondary" className="text-xs mt-1">
              {friend.expert_subject}
            </Badge>
          )}
        </div>
        
        <Button
          onClick={() => handleRemoveFriend(friend.friend_id, friend.display_name)}
          variant="outline"
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  const renderRequestCard = (request: FriendRequest) => (
    <div key={request.request_id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-0.5">
          {request.sender_photo_url ? (
            <img 
              src={request.sender_photo_url} 
              alt={request.sender_display_name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{request.sender_display_name}</h4>
          <p className="text-sm text-muted-foreground truncate">{request.sender_email}</p>
          {request.sender_expert_subject && (
            <Badge variant="secondary" className="text-xs mt-1">
              {request.sender_expert_subject}
            </Badge>
          )}
        </div>
      </div>
      
      {request.message && (
        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">{request.message}</p>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          onClick={() => handleAcceptRequest(request.request_id, request.sender_display_name)}
          size="sm"
          className="flex-1"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Accept
        </Button>
        <Button
          onClick={() => handleRejectRequest(request.request_id)}
          variant="outline"
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  const renderSentRequestCard = (request: SentFriendRequest) => (
    <div key={request.request_id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-0.5">
          {request.receiver_photo_url ? (
            <img 
              src={request.receiver_photo_url} 
              alt={request.receiver_display_name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{request.receiver_display_name}</h4>
          <p className="text-sm text-muted-foreground truncate">{request.receiver_email}</p>
          {request.receiver_expert_subject && (
            <Badge variant="secondary" className="text-xs mt-1">
              {request.receiver_expert_subject}
            </Badge>
          )}
        </div>
      </div>
      
      {request.message && (
        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">{request.message}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Pending</span>
        </div>
        <Button
          onClick={() => handleCancelRequest(request.request_id)}
          variant="outline"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'friends'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          Friends
          {friends.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {friends.length}
            </Badge>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Requests
          {friendRequests.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {friendRequests.length}
            </Badge>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Send className="w-4 h-4" />
          Sent
          {sentRequests.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {sentRequests.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'friends' && (
          <>
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start connecting with fellow UPSC aspirants to build your study network.
                </p>
                <Button onClick={() => setActiveTab('requests')}>
                  Check Friend Requests
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {friends.map(renderFriendCard)}
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {friendRequests.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  When someone sends you a friend request, it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {friendRequests.map(renderRequestCard)}
              </div>
            )}
          </>
        )}

        {activeTab === 'sent' && (
          <>
            {sentRequests.length === 0 ? (
              <div className="text-center py-8">
                <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sent requests</h3>
                <p className="text-muted-foreground">
                  When you send friend requests, they will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sentRequests.map(renderSentRequestCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 