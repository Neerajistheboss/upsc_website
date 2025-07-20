import React, { useState } from 'react'
import { usePublicProfiles } from '@/hooks/usePublicProfiles'
import PublicProfileCard from '@/components/PublicProfileCard'
import { Search, Users, Filter } from 'lucide-react'

const CommunityPage = () => {
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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">UPSC Community</h1>
          </div>
          <p className="text-muted-foreground">
            Connect with fellow UPSC aspirants and find study partners
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, subject, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Subject Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by subject:</span>
            <button
              onClick={() => handleSubjectFilter('')}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedSubject === '' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {subjectOptions.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectFilter(subject)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedSubject === subject 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedSubject) && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {users.length} public profile{users.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Profiles Grid */}
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <PublicProfileCard key={user.id} user={user} showDetails={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No profiles found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedSubject 
                ? 'Try adjusting your search or filters'
                : 'No public profiles available yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommunityPage 