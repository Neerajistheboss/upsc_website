import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, CheckCircle, XCircle, Share, Share2, ShareIcon, MessageSquareShare } from 'lucide-react';
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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVirtualizer } from '@tanstack/react-virtual';
import ChatRoom from './ChatRoom';

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
  password?: string;
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
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [roomToJoin, setRoomToJoin] = useState<Room | null>(null);
  const [roomError, setRoomError] = useState('');
  const [roomSuccess, setRoomSuccess] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [roomNameAvailable, setRoomNameAvailable] = useState<null | boolean>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayNamePrompt, setDisplayNamePrompt] = useState(false);

  // Presence state
  const [onlineCounts, setOnlineCounts] = useState<{ [roomId: string]: number }>({});
  const [totalOnline, setTotalOnline] = useState(0);

  // Typing indicator state
  const [typingUsers, setTypingUsers] = useState<{ [userId: string]: string }>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Unique user ID for presence
  const [userId] = useState(getOrCreateUserId());

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // keep as a fallback estimate, but allow dynamic measurement
    overscan: 8,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  // --- Fetch rooms in realtime ---
  useEffect(() => {
    const roomsRef = ref(db, 'rooms');
    const handle = onValue(roomsRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      const roomList = Object.entries(data).map(([id, value]: any) => ({
        id,
        name: value.name,
        password: value.password || '',
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

  // --- Room name availability check ---
  useEffect(() => {
    if (!newRoomName.trim()) {
      setRoomNameAvailable(null);
      return;
    }
    const exists = rooms.some(r => r.name.trim().toLowerCase() === newRoomName.trim().toLowerCase());
    setRoomNameAvailable(!exists);
  }, [newRoomName, rooms]);

  // --- Listen for typing users in the current room ---
  useEffect(() => {
    if (!currentRoom) {
      setTypingUsers({});
      return;
    }
    const typingRef = ref(db, `typing/${currentRoom.id}`);
    const handle = onValue(typingRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      setTypingUsers(data);
    });
    return () => off(typingRef, 'value', handle);
  }, [currentRoom]);

  // --- Room creation with unique name and password ---
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomError('');
    setRoomSuccess('');
    if (!newRoomName.trim()) return;
    // Check for unique name (case-insensitive)
    const exists = rooms.some(r => r.name.trim().toLowerCase() === newRoomName.trim().toLowerCase());
    if (exists) {
      setRoomError('Room name already exists.');
      return;
    }
    const roomsRef = ref(db, 'rooms');
    const newRoomRef = push(roomsRef);
    await set(newRoomRef, { name: newRoomName.trim(), password: newRoomPassword });
    setNewRoomName('');
    setNewRoomPassword('');
    setRoomSuccess('Room created!');
    setDialogOpen(false);
    setTimeout(() => setRoomSuccess(''), 2000);
  };

  // --- Join room with password check ---
  const handleJoinRoom = (room: Room) => {
    setRoomError('');
    setRoomSuccess('');
    if (room.password) {
      setRoomToJoin(room);
      setJoinPassword('');
    } else {
      // For non-password rooms, still need display name
      if (!displayName) {
        setDisplayNamePrompt(true);
        setCurrentRoom(room);
      } else {
        setCurrentRoom(room);
        setShowShare(true);
      }
    }
  };

  const handleJoinWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomToJoin) return;
    if (roomToJoin.password !== joinPassword) {
      setRoomError('Incorrect password.');
      return;
    }
    setCurrentRoom(roomToJoin);
    setRoomToJoin(null);
    setJoinPassword('');
    setShowShare(true);
  };

  // --- Share link logic ---
  const getRoomShareLink = () => {
    if (!currentRoom) return '';
    const url = window.location.origin + window.location.pathname + `?room=${currentRoom.id}`;
    return url;
  };
  const handleCopyLink = () => {
    const link = getRoomShareLink();
    navigator.clipboard.writeText(link);
    setRoomSuccess('Link copied!');
    setTimeout(() => setRoomSuccess(''), 1500);
  };

  // --- Set display name and join room ---
  const handleSetDisplayName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setDisplayNamePrompt(false);
  };

  // --- Helper to set typing state in Firebase ---
  const setTyping = (isTyping: boolean) => {
    if (!currentRoom || !userId || !displayName) return;
    const typingRef = ref(db, `typing/${currentRoom.id}/${userId}`);
    if (isTyping) {
      set(typingRef, displayName);
    } else {
      set(typingRef, null);
    }
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
    setTyping(false); // Clear typing state on send
    if (messageInputRef.current) messageInputRef.current.focus();
  };

  return (
    <div className="flex-1 w-full flex flex-col ">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        {/* <MessageSquare className="w-6 h-6" /> Chat Rooms (Firebase) */}
        <span className="ml-4 text-base font-normal text-muted-foreground">
          Total online: 
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mx-2 align-middle"></span>
          {totalOnline}
        </span>
      </h2>
      <div className="grid md:grid-cols-3 gap-8 w-full flex-1">
        {/* Room List and Create Room */}
        <div className={`md:col-span-1 space-y-6 ${currentRoom ? 'hidden' : ''} md:block`}>
          <div className="bg-card border rounded-lg p-4  overflow-y-auto">
            <h3 className="font-semibold mb-2">Available Rooms</h3>
            {rooms.length === 0 ? (
              <div className="text-muted-foreground">No rooms yet. Create one!</div>
            ) : (
              <ul className="space-y-2">
                {rooms.map(room => (
                  <li key={room.id}>
                    <div
                       onClick={() => handleJoinRoom(room)} className={`hover:cursor-pointer border flex justify-start gap-4 w-full text-left px-3 py-2 rounded-md transition-colors ${currentRoom?.id === room.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/50'}`}
                    >
                      <div className='flex items-center justify-between w-full'>
                        {room.name}
                      </div>
                      <div className='flex items-center justify-between w-full'>
                        <div  className='flex items-center justify-between w-full'>
                          <div>
                            {onlineCounts[room.id] > 0 && (
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500  align-middle"></span>
                            )}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {onlineCounts[room.id] || 0} online
                            </span>
                            {room.password && <span className="ml-2 text-xs text-yellow-600">🔒</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Chat UI */}
        <div className={`w-full flex-1 flex flex-col ${currentRoom ? '' : 'md:col-span-2'}`}>
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
          {roomToJoin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <form onSubmit={handleJoinWithPassword} className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm relative">
                <h3 className="text-lg font-semibold mb-4 text-center">Enter password for <span className='text-primary'>{roomToJoin.name}</span></h3>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={e => setJoinPassword(e.target.value)}
                  placeholder="Room password"
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground mb-4"
                  autoFocus
                  maxLength={32}
                />
                <div className="flex gap-2 justify-end">
                  <button type="button" className="px-4 py-2 rounded-md bg-muted text-foreground" onClick={() => setRoomToJoin(null)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Join</button>
                </div>
                {roomError && <div className="text-red-500 text-xs mt-2">{roomError}</div>}
              </form>
            </div>
          )}
          {/* {showShare && currentRoom && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={getRoomShareLink()}
                readOnly
                className="px-2 py-1 border rounded text-xs w-64 bg-background"
                onFocus={e => e.target.select()}
              />
              <button onClick={handleCopyLink} className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">Copy Link</button>
              {roomSuccess && <span className="text-green-600 text-xs ml-2">{roomSuccess}</span>}
            </div>
          )} */}
          {currentRoom ? (
            <ChatRoom
              messages={messages}
              displayName={displayName}
              messageText={messageText}
              setMessageText={setMessageText}
              handleSendMessage={handleSendMessage}
              typingUsers={typingUsers}
              userId={userId}
              parentRef={parentRef}
              virtualizer={virtualizer}
              messageInputRef={messageInputRef}
              chatEndRef={chatEndRef}
              setTyping={setTyping}
            />
          ) : (
            null
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms; 