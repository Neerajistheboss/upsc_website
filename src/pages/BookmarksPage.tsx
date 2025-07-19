import React, { useState, useMemo } from 'react'
import { useCurrentAffairs } from '@/hooks/useCurrentAffairs'
import { useToast } from '@/hooks/useToast'
import type { CurrentAffairsItem } from '@/hooks/useCurrentAffairs'

const BookmarksPage = () => {
  const { currentAffairsData, loading, error, toggleBookmark } = useCurrentAffairs()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const toast = useToast()

  const categories = [
    'All Categories',
    'Science & Technology',
    'International Relations',
    'Economy',
    'Environment',
    'Health',
    'Education',
    'Agriculture',
    'Defense',
    'Infrastructure',
    'Sports',
    'Politics',
    'Society',
    'Culture',
    'Geography',
    'History'
  ]

  // Filter to show only bookmarked items
  const bookmarkedAffairs = useMemo(() => {
    let filtered = currentAffairsData.filter(affair => affair.bookmarked)
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(affair => 
        affair.title.toLowerCase().includes(term) ||
        affair.summary.toLowerCase().includes(term) ||
        affair.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(affair => affair.category === selectedCategory)
    }
    
    return filtered
  }, [currentAffairsData, searchTerm, selectedCategory])

  const handleRemoveBookmark = async (affair: CurrentAffairsItem) => {
    try {
      await toggleBookmark(affair.id, false)
      toast.success('Removed from bookmarks', 'Current affairs removed from your saved items')
    } catch (err) {
      toast.error('Failed to remove bookmark', 'Please try again')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookmarks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading bookmarks: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Bookmarks</h1>
          <p className="text-lg text-muted-foreground">
            Your saved current affairs for quick access and revision.
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            {bookmarkedAffairs.length} bookmarked item{bookmarkedAffairs.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 p-6 bg-card rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search Bookmarks
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by title, summary, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="space-y-6">
          {bookmarkedAffairs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-lg font-medium">
                  {searchTerm || selectedCategory !== 'All Categories' 
                    ? 'No bookmarks found' 
                    : 'No bookmarks yet'
                  }
                </p>
                <p className="text-sm">
                  {searchTerm || selectedCategory !== 'All Categories'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start saving current affairs to see them here'
                  }
                </p>
                {!searchTerm && selectedCategory === 'All Categories' && (
                  <button 
                    onClick={() => window.location.href = '/current-affairs'}
                    className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                  >
                    Browse Current Affairs
                  </button>
                )}
              </div>
            </div>
          ) : (
            bookmarkedAffairs.map((affair) => (
              <div
                key={affair.id}
                className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{affair.title}</h3>
                    <p className="text-muted-foreground mb-3">{affair.summary}</p>
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getImportanceColor(affair.importance)}`}>
                      {affair.importance}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(affair.date)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {affair.category}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      {affair.source}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {affair.source_url ? (
                      <a
                        href={affair.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Read More
                      </a>
                    ) : null}
                    <button 
                      onClick={() => handleRemoveBookmark(affair)} 
                      className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {affair.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Study Tips */}
        {bookmarkedAffairs.length > 0 && (
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">📚 Study Tips for Your Bookmarks</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">🎯 Revision Strategy</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Review bookmarked items weekly</li>
                  <li>• Connect with static syllabus topics</li>
                  <li>• Practice answer writing with these topics</li>
                  <li>• Create mind maps for complex issues</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">📝 Note Making</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Add your own analysis and opinions</li>
                  <li>• Note multiple perspectives on issues</li>
                  <li>• Link with previous year questions</li>
                  <li>• Update notes as events develop</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookmarksPage 