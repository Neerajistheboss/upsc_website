import React from 'react'
import { Users, UserPlus } from 'lucide-react'

interface CommunityTabNavigationProps {
  activeTab: 'community' | 'friends'
  setActiveTab: (tab: 'community' | 'friends') => void
}

const CommunityTabNavigation: React.FC<CommunityTabNavigationProps> = ({ activeTab, setActiveTab }) => (
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
  </div>
)

export default CommunityTabNavigation 