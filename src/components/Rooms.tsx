import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  off,
  serverTimestamp,
  update,
  DataSnapshot,
  onDisconnect,
} from 'firebase/database';

// --- Firebase config from .env ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app only once
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- Types ---
type Room = {
  id: string;
  name: string;
};

type Message = {
  id: string;
  user: string;
  content: string;
  createdAt: number;
};

const getOrCreateUserId = () => {
  let id = localStorage.getItem('firebaseUserId');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2);
    localStorage.setItem('firebaseUserId', id);
  }
  return id;
};

const Rooms: React.FC = () => {
  // Room state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayNamePrompt, setDisplayNamePrompt] = useState(false);

  // Presence state
  const [onlineCounts, setOnlineCounts] = useState<{ [roomId: string]: number }>({});
  const [totalOnline, setTotalOnline] = useState(0);

  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Unique user ID for presence
  const [userId] = useState(getOrCreateUserId());

  // --- Fetch rooms in realtime ---
  useEffect(() => {
    const roomsRef = ref(db, 'rooms');
    const handle = onValue(roomsRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      const roomList = Object.entries(data).map(([id, value]: any) => ({
        id,
        name: value.name,
      }));
      setRooms(roomList);
    });
    return () => off(roomsRef, 'value', handle);
  }, []);

  // --- Fetch messages for current room in realtime ---
  useEffect(() => {
    if (!currentRoom) {
      setMessages([]);
      return;
    }
    const messagesRef = ref(db, `messages/${currentRoom.id}`);
    const handle = onValue(messagesRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      const msgList = Object.entries(data).map(([id, value]: any) => ({
        id,
        user: value.user,
        content: value.content,
        createdAt: value.createdAt,
      }));
      // Sort by createdAt
      msgList.sort((a, b) => a.createdAt - b.createdAt);
      setMessages(msgList);
    });
    return () => off(messagesRef, 'value', handle);
  }, [currentRoom]);

  // --- Presence: update on mount, room change, and disconnect ---
  useEffect(() => {
    const presenceRef = ref(db, `presence/${userId}`);
    // Mark as online and in current room
    update(presenceRef, { online: true, roomId: currentRoom?.id || null });
    // On disconnect, mark as offline
    onDisconnect(presenceRef).update({ online: false, roomId: null });
    return () => {
      // Optionally mark as offline on unmount
      update(presenceRef, { online: false, roomId: null });
    };
  }, [userId, currentRoom?.id]);

  // --- Listen for presence changes to update counts ---
  useEffect(() => {
    const presenceRef = ref(db, 'presence');
    const handle = onValue(presenceRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      let total = 0;
      const roomCounts: { [roomId: string]: number } = {};
      Object.values<any>(data).forEach((user: any) => {
        if (user.online) {
          total += 1;
          if (user.roomId) {
            roomCounts[user.roomId] = (roomCounts[user.roomId] || 0) + 1;
          }
        }
      });
      setTotalOnline(total);
      setOnlineCounts(roomCounts);
    });
    return () => off(presenceRef, 'value', handle);
  }, []);

  // --- Auto-scroll chat ---
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // --- Room creation ---
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const roomsRef = ref(db, 'rooms');
    const newRoomRef = push(roomsRef);
    await set(newRoomRef, { name: newRoomName.trim() });
    setNewRoomName('');
  };

  // --- Join room ---
  const handleJoinRoom = (room: Room) => {
    if (!displayName) {
      setDisplayNamePrompt(true);
      setCurrentRoom(room);
    } else {
      setCurrentRoom(room);
    }
  };

  // --- Set display name and join room ---
  const handleSetDisplayName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setDisplayNamePrompt(false);
  };

  // --- Send message ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentRoom || !displayName) return;
    const messagesRef = ref(db, `messages/${currentRoom.id}`);
    const newMsgRef = push(messagesRef);
    await set(newMsgRef, {
      user: displayName,
      content: messageText.trim(),
      createdAt: Date.now(),
    });
    setMessageText('');
    if (messageInputRef.current) messageInputRef.current.focus();
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" /> Chat Rooms (Firebase)
        <span className="ml-4 text-base font-normal text-muted-foreground">
          Total online: 
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mx-2 align-middle"></span>
          {totalOnline}
          </span>
      </h2>
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
            {rooms.length === 0 ? (
              <div className="text-muted-foreground">No rooms yet. Create one!</div>
            ) : (
              <ul className="space-y-2">
                {rooms.map(room => (
                  <li key={room.id}>
                    <button
                      className={`flex justify-start gap-4 w-full text-left px-3 py-2 rounded-md transition-colors ${currentRoom?.id === room.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/50'}`}
                      onClick={() => handleJoinRoom(room)}
                    >
                      {/* Green dot if online */}
                      {room.name}
                      <div>

                      {onlineCounts[room.id] > 0 && (
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500  align-middle"></span>
                      )}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {onlineCounts[room.id] || 0} online
                      </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Chat UI */}
        <div className="md:col-span-2">
          {/* Display name prompt modal */}
          {displayNamePrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <form onSubmit={handleSetDisplayName} className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm relative">
                <h3 className="text-lg font-semibold mb-4 text-center">Enter a display name to join <span className='text-primary'>{currentRoom?.name}</span></h3>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name in this room..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground mb-4"
                  autoFocus
                  maxLength={32}
                />
                <div className="flex gap-2 justify-end">
                  <button type="button" className="px-4 py-2 rounded-md bg-muted text-foreground" onClick={() => setDisplayNamePrompt(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Join</button>
                </div>
              </form>
            </div>
          )}
          {currentRoom ? (
            <div className="flex flex-col h-[32rem] bg-card border rounded-lg">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold text-lg">Room: {currentRoom.name}</div>
                <button className="text-sm text-muted-foreground hover:text-primary px-4 py-2 rounded-md bg-red-500 text-white" onClick={() => setCurrentRoom(null)}>Leave Room</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                {messages.length === 0 ? (
                  <div className="text-muted-foreground">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.user === displayName ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.user === displayName ? 'bg-primary/90 text-primary-foreground' : 'bg-muted text-foreground'}`}>
                        <div className="text-xs font-medium mb-1">{msg.user}</div>
                        <div>{msg.content}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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