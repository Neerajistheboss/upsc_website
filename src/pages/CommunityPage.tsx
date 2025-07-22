import { useState, useEffect } from 'react'
import { FriendsTab } from '@/components/FriendsTab'
import { Users, UserPlus, MessageSquare } from 'lucide-react'
import CommunityHeader from '@/components/CommunityHeader'
import Rooms from '@/components/Rooms'
import CommunityDiscoverTab from '@/components/CommunityDiscoverTab'
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, DataSnapshot } from 'firebase/database';

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

const getOrCreateUserId = () => {
  let id = localStorage.getItem('firebaseUserId');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2);
    localStorage.setItem('firebaseUserId', id);
  }
  return id;
};

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState<'community' | 'friends' | 'rooms'>('community')
  const [totalOnline, setTotalOnline] = useState(0);
  const [userId] = useState(getOrCreateUserId());

  // --- Listen for presence changes to update counts ---
  useEffect(() => {
    const presenceRef = ref(db, 'presence');
    const handle = onValue(presenceRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      let total = 0;
      Object.values<any>(data).forEach((user: any) => {
        if (user.online) {
          total += 1;
        }
      });
      setTotalOnline(total);
    });
    return () => off(presenceRef, 'value', handle);
  }, []);

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col bg-background">
      <div className="flex-1 flex flex-col w-screen mx-auto px-2">
        {/* Header */}
        {/* <CommunityHeader /> */}

        {/* Tab Navigation */}
        <div className="flex border-b border-border  w-full overflow-x-hidden">
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
            className={`flex items-center gap-2 px-2 py-3 border-b-2 transition-colors ${
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
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {totalOnline + 5}
            </div>
          </button>
        </div>

        {/* Community Tab Content */}
        {activeTab === 'community' && (
          <CommunityDiscoverTab/>
        )}
        

        {/* Friends Tab Content */}
        {activeTab === 'friends' && (
          <FriendsTab />
        )}

        {/* Rooms Tab Content */}
        {activeTab === 'rooms' && (
          <Rooms />
        )}
      </div>
    </div>
  )
}

export default CommunityPage 