import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Room {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_display_name?: string;
  user_photo_url?: string;
}

export interface RoomPresence {
  [roomId: string]: {
    users: Array<{ user_id: string; display_name?: string }>,
    count: number
  }
}

export const useRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [roomPresence, setRoomPresence] = useState<RoomPresence>({});
  const roomsSubscription = useRef<any>(null);
  const messagesSubscription = useRef<any>(null);
  const presenceChannel = useRef<any>(null);

  // List all rooms
  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setRooms(data || []);
    setLoadingRooms(false);
  }, []);

  // Create a new room
  const createRoom = useCallback(async (name: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('rooms')
      .insert({ name, created_by: user.id })
      .select()
      .single();
    if (!error && data) {
      setRooms((prev) => [data, ...prev]);
      return data;
    }
    return null;
  }, [user]);

  // Join a room (fetch messages and subscribe)
  const joinRoom = useCallback(async (room: Room) => {
    setCurrentRoom(room);
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('room_messages')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true });
    if (!error) setMessages(data || []);
    setLoadingMessages(false);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !currentRoom) return;
    await supabase.from('room_messages').insert({
      room_id: currentRoom.id,
      user_id: user.id,
      content,
    });
  }, [user, currentRoom]);

  // Subscribe to real-time updates for rooms
  useEffect(() => {
    fetchRooms();
    if (roomsSubscription.current) roomsSubscription.current.unsubscribe();
    roomsSubscription.current = supabase
      .channel('rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        fetchRooms();
      })
      .subscribe();
    return () => {
      if (roomsSubscription.current) roomsSubscription.current.unsubscribe();
    };
  }, [fetchRooms]);

  // Subscribe to real-time updates for messages in the current room
  useEffect(() => {
    if (!currentRoom) return;
    if (messagesSubscription.current) messagesSubscription.current.unsubscribe();
    messagesSubscription.current = supabase
      .channel('room_messages_' + currentRoom.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_messages', filter: `room_id=eq.${currentRoom.id}` }, (payload) => {
        joinRoom(currentRoom);
      })
      .subscribe();
    return () => {
      if (messagesSubscription.current) messagesSubscription.current.unsubscribe();
    };
  }, [currentRoom, joinRoom]);

  // Presence: subscribe to presence in the current room
  useEffect(() => {
    if (!currentRoom || !user) return;
    if (presenceChannel.current) presenceChannel.current.unsubscribe();
    presenceChannel.current = supabase.channel('room-presence-' + currentRoom.id, {
      config: { presence: { key: currentRoom.id } }
    });
    // Track this user in the room
    presenceChannel.current.track({
      user_id: user.id,
      display_name: user.displayName || user.email || 'Anonymous'
    });
    
    // Listen for presence sync
    presenceChannel.current.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.current.presenceState();
      const users = Object.values(state).map((entry: any) => ({
        user_id: entry.user_id,
        display_name: entry.display_name,
      }));
      setRoomPresence(prev => ({
        ...prev,
        [currentRoom.id]: { users, count: users.length }
      }));
      
    });
    presenceChannel.current.subscribe();
    return () => {
      if (presenceChannel.current) presenceChannel.current.unsubscribe();
    };
  }, [currentRoom, user]);

  return {
    rooms,
    loadingRooms,
    createRoom,
    joinRoom,
    currentRoom,
    messages,
    loadingMessages,
    sendMessage,
    setCurrentRoom,
    roomPresence,
  };
}; 