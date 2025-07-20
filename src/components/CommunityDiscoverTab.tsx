import React, { useState } from 'react';
import CommunitySearchFilter from '@/components/CommunitySearchFilter';
import CommunityResultsCount from '@/components/CommunityResultsCount';
import PublicProfileCard from '@/components/PublicProfileCard';
import { usePublicProfiles } from '@/hooks/usePublicProfiles';


const CommunityDiscoverTab: React.FC= () => {
  const { users, loading, error, searchProfiles, filterByExpertSubject } = usePublicProfiles()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

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
            {/* <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              Try Again
            </button> */}
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      <CommunitySearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        subjectOptions={subjectOptions}
        handleSubjectFilter={handleSubjectFilter}
        clearFilters={clearFilters}
        selectedSubject={selectedSubject}
      />
      <CommunityResultsCount usersLength={users.length} searchQuery={searchQuery} selectedSubject={selectedSubject} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <PublicProfileCard key={user.id} user={user} />
        ))}
      </div>
    </>
  );
};

export default CommunityDiscoverTab; 