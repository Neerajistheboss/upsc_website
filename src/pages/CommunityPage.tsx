import React, { useState, useRef, useEffect } from 'react'
import { usePublicProfiles } from '@/hooks/usePublicProfiles'
import PublicProfileCard from '@/components/PublicProfileCard'
import { FriendsTab } from '@/components/FriendsTab'
import { Search, Users, Filter, UserPlus, MessageSquare } from 'lucide-react'
import CommunityHeader from '@/components/CommunityHeader'
import CommunityTabNavigation from '@/components/CommunityTabNavigation'
import CommunitySearchFilter from '@/components/CommunitySearchFilter'
import CommunityResultsCount from '@/components/CommunityResultsCount'
import { useRooms } from '@/hooks/useRooms'
import type { Room } from '@/hooks/useRooms'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const CommunityPage = () => {
  // const { users, loading, error, searchProfiles, filterByExpertSubject } = usePublicProfiles()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [activeTab, setActiveTab] = useState<'community' | 'friends' | 'rooms'>('community')

  // Rooms logic
  const {
    rooms,
    loadingRooms,
    createRoom,
    joinRoom,
    currentRoom,
    messages: roomsMessages,
    loadingMessages,
    sendMessage,
    setCurrentRoom,
    roomPresence,
  } = useRooms();
  const { user } = useAuth();
  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(roomsMessages);
  // Sync local messages with useRooms messages on room join or realtime update
  useEffect(() => {
    setMessages(roomsMessages);
  }, [roomsMessages, currentRoom]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentRoom]);

  // Room creation state
  const [newRoomName, setNewRoomName] = useState('');
  const [messageText, setMessageText] = useState('');

  // Display name state
  const [roomDisplayNames, setRoomDisplayNames] = useState<{ [roomId: string]: string }>({});
  const [pendingRoom, setPendingRoom] = useState<null | Room>(null);
  const [displayNameInput, setDisplayNameInput] = useState('');

  // Debug logging
  // console.log('CommunityPage - users:', users.length)

  const subjectOptions = [
    'General Studies', 'History', 'Geography', 'Polity', 'Economics', 
    'Environment', 'Science & Tech', 'Ethics', 'Essay', 'Optional Subject', 'CSAT'
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // searchProfiles(searchQuery.trim())
    }
  }

  const handleSubjectFilter = (subject: string) => {
    setSelectedSubject(subject)
    if (subject) {
      // filterByExpertSubject(subject)
    } else {
      // Reset to show all public profiles
      // searchProfiles('')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSubject('')
    // searchProfiles('')
  }

  // Handle sending a message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !currentRoom || !user) return;
    // Optimistically add the message to the UI
    const optimisticMsg = {
      id: 'optimistic-' + Date.now(),
      room_id: currentRoom.id,
      user_id: user.id,
      content: messageText.trim(),
      created_at: new Date().toISOString(),
      user_display_name: roomDisplayNames[currentRoom.id] || user.email || 'You',
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setMessageText('');
    if (messageInputRef.current) messageInputRef.current.focus();
    // Send to backend (will be replaced by realtime update)
    await sendMessage(optimisticMsg.content);
  };

  // Handle creating a room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    await createRoom(newRoomName.trim());
    setNewRoomName('');
  };

  // When user clicks a room, prompt for display name if not set
  const handleJoinRoom = (room: Room) => {
    if (!user) {
      toast.error('Please log in to join a room');
      return;
    }
    if (!roomDisplayNames[room.id]) {
      setPendingRoom(room);
      setDisplayNameInput('');
    } else {
      joinRoom(room);
    }
  };

  // When user submits display name, join the room
  const handleSetDisplayName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRoom || !displayNameInput.trim()) return;
    setRoomDisplayNames(prev => ({ ...prev, [pendingRoom.id]: displayNameInput.trim() }));
    joinRoom(pendingRoom);
    setPendingRoom(null);
    setDisplayNameInput('');
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-background p-4">
  //       <div className="max-w-6xl mx-auto">
  //         <div className="flex items-center justify-center h-64">
  //           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  //           <span className="ml-2">Loading community...</span>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-background p-4">
  //       <div className="max-w-6xl mx-auto">
  //         <div className="text-center py-8">
  //           <p className="text-red-600">Error: {error}</p>
  //           <button 
  //             onClick={() => window.location.reload()} 
  //             className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
  //           >
  //             Try Again
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <CommunityHeader />

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'community'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Discover
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'friends'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Friends
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'rooms'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Rooms
          </button>
        </div>

        {/* Community Tab Content */}
        

        {/* Friends Tab Content */}
        {activeTab === 'friends' && (
          <FriendsTab />
        )}

        {/* Rooms Tab Content */}
        {activeTab === 'rooms' && (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-6 h-6" /> Chat Rooms</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Room List and Create Room */}
              <div className="md:col-span-1 space-y-6">
                <form onSubmit={handleCreateRoom} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    placeholder="Create new room..."
                    className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground"
                  />
                  <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Create</button>
                </form>
                <div className="bg-card border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold mb-2">Available Rooms</h3>
                  {loadingRooms ? (
                    <div className="text-muted-foreground">Loading rooms...</div>
                  ) : rooms.length === 0 ? (
                    <div className="text-muted-foreground">No rooms yet. Create one!</div>
                  ) : (
                    <ul className="space-y-2">
                      {rooms.map(room => {
                        const presence = roomPresence[room.id];
                        return (
                          <li key={room.id}>
                            <button
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${currentRoom?.id === room.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/50'}`}
                              onClick={() => handleJoinRoom(room)}
                            >
                              {room.name}
                              <span className="ml-2 text-xs text-muted-foreground">
                                {presence ? `${presence.count} user${presence.count !== 1 ? 's' : ''} online` : '0 users online'}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
              {/* Chat UI */}
              <div className="md:col-span-2">
                {/* Display name prompt modal */}
                {pendingRoom && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <form onSubmit={handleSetDisplayName} className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm relative">
                      <h3 className="text-lg font-semibold mb-4 text-center">Enter a display name for <span className='text-primary'>{pendingRoom.name}</span></h3>
                      <input
                        type="text"
                        value={displayNameInput}
                        onChange={e => setDisplayNameInput(e.target.value)}
                        placeholder="Your name in this room..."
                        className="w-full px-3 py-2 border rounded-md bg-background text-foreground mb-4"
                        autoFocus
                        maxLength={32}
                      />
                      <div className="flex gap-2 justify-end">
                        <button type="button" className="px-4 py-2 rounded-md bg-muted text-foreground" onClick={() => setPendingRoom(null)}>Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Join</button>
                      </div>
                    </form>
                  </div>
                )}
                {currentRoom ? (
                  <div className="flex flex-col h-[32rem] bg-card border rounded-lg">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="font-semibold text-lg">Room: {currentRoom.name}</div>
                      <button className="text-sm text-muted-foreground hover:text-primary" onClick={() => setCurrentRoom(null)}>Leave</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                      {loadingMessages && messages.length === 0 ? (
                        <div className="text-muted-foreground">Loading messages...</div>
                      ) : messages.length === 0 ? (
                        <div className="text-muted-foreground">No messages yet. Start the conversation!</div>
                      ) : (
                        messages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.user_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                              <div className="text-xs font-medium mb-1">{msg.user_display_name || roomDisplayNames[msg.room_id] || msg.user_id}</div>
                              <div>{msg.content}</div>
                              <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-background">
                      <input
                        ref={messageInputRef}
                        type="text"
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground"
                        autoComplete="off"
                      />
                      <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Send</button>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[32rem] bg-card border rounded-lg text-muted-foreground">
                    Select a room to join the chat.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommunityPage 