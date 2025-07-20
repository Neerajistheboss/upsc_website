import React, { useState } from 'react'
import { usePublicProfiles } from '@/hooks/usePublicProfiles'
import PublicProfileCard from '@/components/PublicProfileCard'
import { FriendsTab } from '@/components/FriendsTab'
import { Search, Users, Filter, UserPlus } from 'lucide-react'
import CommunityHeader from '@/components/CommunityHeader'
import CommunityTabNavigation from '@/components/CommunityTabNavigation'
import CommunitySearchFilter from '@/components/CommunitySearchFilter'
import CommunityResultsCount from '@/components/CommunityResultsCount'

const CommunityPage = () => {
  const { users, loading, error, searchProfiles, filterByExpertSubject } = usePublicProfiles()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [activeTab, setActiveTab] = useState<'community' | 'friends'>('community')

  // Debug logging
  console.log('CommunityPage - users:', users.length)

  const subjectOptions = [
    'General Studies', 'History', 'Geography', 'Polity', 'Economics', 
    'Environment', 'Science & Tech', 'Ethics', 'Essay', 'Optional Subject', 'CSAT'
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchProfiles(searchQuery.trim())
    }
  }

  const handleSubjectFilter = (subject: string) => {
    setSelectedSubject(subject)
    if (subject) {
      filterByExpertSubject(subject)
    } else {
      // Reset to show all public profiles
      searchProfiles('')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSubject('')
    searchProfiles('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading community...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <CommunityHeader />

        {/* Tab Navigation */}
        <CommunityTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Community Tab Content */}
        {activeTab === 'community' && (
          <>
            {/* Search and Filter Controls */}
            <CommunitySearchFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              subjectOptions={subjectOptions}
              selectedSubject={selectedSubject}
              handleSubjectFilter={handleSubjectFilter}
              clearFilters={clearFilters}
            />

            {/* Results Count */}
            <CommunityResultsCount
              usersLength={users.length}
              searchQuery={searchQuery}
              selectedSubject={selectedSubject}
            />

            {/* Profiles Grid */}
            {users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                  <PublicProfileCard 
                    key={user.id} 
                    user={user} 
                    showDetails={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No profiles found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery || selectedSubject 
                    ? 'Try adjusting your search or filters to find more community members'
                    : 'Be the first to join our UPSC community! Create your profile to connect with fellow aspirants.'
                  }
                </p>
                {!searchQuery && !selectedSubject && (
                  <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Create Profile
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Friends Tab Content */}
        {activeTab === 'friends' && (
          <FriendsTab />
        )}
      </div>
    </div>
  )
}

export default CommunityPage 