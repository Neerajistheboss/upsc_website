import { useState } from 'react'
import { FriendsTab } from '@/components/FriendsTab'
import { Users, UserPlus, MessageSquare } from 'lucide-react'
import CommunityHeader from '@/components/CommunityHeader'
import Rooms from '@/components/Rooms'
import CommunityDiscoverTab from '@/components/CommunityDiscoverTab'

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState<'community' | 'friends' | 'rooms'>('community')


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
        {activeTab === 'community' && (
          <CommunityDiscoverTab/>
        )}
        

        {/* Friends Tab Content */}
        {activeTab === 'friends' && (
          <FriendsTab />
        )}

        {/* Rooms Tab Content */}
        {activeTab === 'rooms' && (
          <Rooms/>
        )}
      </div>
    </div>
  )
}

export default CommunityPage 