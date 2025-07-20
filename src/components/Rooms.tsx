import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

// Types for props
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';


const Rooms: React.FC = ({}) => {
 
  const { user } = useAuth();
  // Local state and refs
  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [roomDisplayNames, setRoomDisplayNames] = useState<{ [roomId: string]: string }>({});
  const [pendingRoom, setPendingRoom] = useState<null | Room>(null);
  const [displayNameInput, setDisplayNameInput] = useState('');

  // Handle sending a message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !currentRoom || !user) return;
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
      toast.warning('Please log in to join a room');
      return;
    }
    console.log('roomDisplayNames', roomDisplayNames)
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

  return (
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
  );
};

export default Rooms; 