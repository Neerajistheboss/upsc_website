import React, { useState } from 'react'
import { usePublicProfiles } from '@/hooks/usePublicProfiles'
import PublicProfileCard from '@/components/PublicProfileCard'
import { Search, Users, Filter } from 'lucide-react'

const CommunityPage = () => {
  const { users, loading, error, searchProfiles, filterByExpertSubject } = usePublicProfiles()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

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
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, subject, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border/50 rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Search
            </button>
          </form>

          {/* Subject Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filter by subject:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSubjectFilter('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedSubject === '' 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                All Subjects
              </button>
              {subjectOptions.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectFilter(subject)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedSubject === subject 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedSubject) && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {users.length} public profile{users.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary">
              👋 <strong>Join the community!</strong> Sign up to connect with fellow UPSC aspirants.
            </p>
          </div>
        </div>

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
      </div>
    </div>
  )
}

export default CommunityPage 