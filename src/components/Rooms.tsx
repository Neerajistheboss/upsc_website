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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

// --- AI Names for replies ---
const AI_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery'];
const TOTAL_AI_USERS = 5;

function getRandomAIName() {
  return AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
}

// Helper to distribute N AI users randomly across M rooms (public only)
function distributeAIUsersToPublicRooms(rooms: Room[], totalAI: number) {
  const publicRoomIndexes = rooms
    .map((room, idx) => ({ room, idx }))
    .filter(({ room }) => !room.password)
    .map(({ idx }) => idx);
  const arr = Array(rooms.length).fill(0);
  if (publicRoomIndexes.length === 0) return arr;
  for (let i = 0; i < totalAI; i++) {
    const randIdx = publicRoomIndexes[Math.floor(Math.random() * publicRoomIndexes.length)];
    arr[randIdx]++;
  }
  return arr;
}

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

  const [searchQuery, setSearchQuery] = useState('');

  // Filtered rooms based on search
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // AI distribution state
  const [aiDistribution, setAIDistribution] = useState<number[]>([]);

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
    if (!displayName) {
      setDisplayNamePrompt(true);
      setCurrentRoom(roomToJoin);
    } else {
      setCurrentRoom(roomToJoin);
      setShowShare(true);
    }
    setRoomToJoin(null);
    setJoinPassword('');
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

  // --- Fetch AI reply from OpenAI ---
  async function fetchAIReply(userMessage: string) {
    // WARNING: Exposing API keys in frontend is not secure for production!
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'you are a upsc student who is helping other upsc students to prepare for the exam. you have a lot of knowledge about the exam and you are able to help them with their questions. the messages are in hinglish (hindi written using english characters).keep replies short and casual.dont sound like a assitant or robot' },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 100,
        }),
      });
      if (!response.ok) {
        // If 429 or any error, return empty string (no reply)
        return '';
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err) {
      // On network or other error, return empty string
      return '';
    }
  }

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

    // --- AI REPLY LOGIC ---
    // Only trigger AI reply if the sender is not one of the AI names and the room is public
    if (!AI_NAMES.includes(displayName) && currentRoom && !currentRoom.password) {
      const userMsg = messageText.trim();
      setTimeout(async () => {
        const aiReply = await fetchAIReply(userMsg);
        if (!aiReply) return;
        // Add a random delay between 5 and 10 seconds before sending the AI reply
        const delayMs = 5000 + Math.floor(Math.random() * 5000); // 5000-10000 ms
        setTimeout(async () => {
          const autoReplyRef = push(messagesRef);
          await set(autoReplyRef, {
            user: getRandomAIName(),
            content: aiReply,
            createdAt: Date.now(),
          });
        }, delayMs);
      }, 1000);
    }
  };

  // Update AI distribution whenever rooms list changes
  useEffect(() => {
    setAIDistribution(distributeAIUsersToPublicRooms(rooms, TOTAL_AI_USERS));
  }, [rooms.length]);

  return (
    <div className="flex-1 w-full flex flex-col ">
      <h2 className="text-2xl font-bold my-1 flex items-center gap-2">
        {/* <MessageSquare className="w-6 h-6" /> Chat Rooms (Firebase) */}
        <span className="ml-4 text-base font-normal text-muted-foreground">
          Total online: 
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mx-2 align-middle"></span>
          {totalOnline + aiDistribution.reduce((a, b) => a + b, 0)}
        </span>
      </h2>
      <div className="grid md:grid-cols-3 gap-8 w-full flex-1">
        {/* Room List and Create Room */}
        <div className={`md:col-span-1 space-y-6 ${currentRoom ? 'hidden' : ''} md:block`}>
          <div className="bg-card border rounded-lg p-4  overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Available Rooms</h3>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="default">Create Room</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a new room</DialogTitle>
                    <DialogDescription>Room names must be unique. Password is optional.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Room name"
                      value={newRoomName}
                      onChange={e => setNewRoomName(e.target.value)}
                      maxLength={32}
                      autoFocus
                      required
                      autoComplete='new-email'
                    />
                    {roomNameAvailable === false && (
                      <div className="text-xs text-red-500">Room name already exists.</div>
                    )}
                    <Input
                      type="password"
                      placeholder="Password (optional)"
                      value={newRoomPassword}
                      onChange={e => setNewRoomPassword(e.target.value)}
                      maxLength={32}
                      autoComplete='new-password'
                    />
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" variant="default" disabled={!newRoomName.trim() || roomNameAvailable === false}>Create</Button>
                    </div>
                    {roomError && <div className="text-xs text-red-500">{roomError}</div>}
                    {roomSuccess && <div className="text-xs text-green-600">{roomSuccess}</div>}
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {/* Room search filter if more than 10 rooms */}
            {rooms.length > 10 && (
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className=""
                />
              </div>
            )}
            {rooms.length === 0 ? (
              <div className="text-muted-foreground">No rooms yet. Create one!</div>
            ) : (
              <ul className="space-y-2">
                {(rooms.length > 10 ? filteredRooms : rooms).map((room, idx) => (
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
                              {(() => {
                                const aiCount = room.password ? 0 : (aiDistribution[idx] || 0);
                                const total = (onlineCounts[room.id] || 0) + aiCount;
                                return <>
                                  {total > 0 && (
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 align-middle mr-1"></span>
                                  )}
                                  {total} online
                                </>;
                              })()}
                              {room.password && <span className="ml-2 text-xs text-yellow-600">🔒</span>}
                            </span>
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
        <div className={`md:col-span-2 flex-1 flex flex-col ${currentRoom ? '' : 'md:col-span-2'}`}>
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
            <>
              <div className="p-1 flex items-center justify-between">
                <div className="font-semibold text-lg">Room: {currentRoom.name}</div>
                <button className="text-sm text-muted-foreground hover:text-primary px-4 py-2 rounded-md bg-red-500 text-white" onClick={() => setCurrentRoom(null)}>Leave Room</button>
              </div>
              <ChatRoom
                messages={messages}
                displayName={displayName}
                messageText={messageText}
                setMessageText={setMessageText}
                handleSendMessage={handleSendMessage}
                typingUsers={typingUsers}
                userId={userId}
                messageInputRef={messageInputRef as React.RefObject<HTMLInputElement>}
                setTyping={setTyping}
              />
            </>
          ) : (
            null
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms; 