import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentAffairs } from '@/hooks/useCurrentAffairs'
import { useToast } from '@/hooks/useToast'
import type { CurrentAffairsItem } from '@/hooks/useCurrentAffairs'
import { useAuth } from '@/contexts/AuthContext'

const CurrentAffairsPage = () => {
  const { currentAffairsData, loading, error, toggleBookmark,fetchCurrentAffairs } = useCurrentAffairs()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedImportance, setSelectedImportance] = useState('')
  const [showBookmarked, setShowBookmarked] = useState(false)
  const toast = useToast()
  const { user } = useAuth()


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

  const importanceLevels = ['All', 'High', 'Medium', 'Low']

  // Filter current affairs based on search, category, importance, and bookmark toggle
  const filteredAffairs = useMemo(() => {
    return currentAffairsData.filter((item) => {
      if (showBookmarked && !item.bookmarked) return false
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === '' || 
        selectedCategory === 'All Categories' || 
        item.category === selectedCategory
      const matchesImportance = selectedImportance === '' || 
        selectedImportance === 'All' || 
        item.importance === selectedImportance
      return matchesSearch && matchesCategory && matchesImportance
    })
  }, [currentAffairsData, searchTerm, selectedCategory, selectedImportance, showBookmarked])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading current affairs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading current affairs: {error}</p>
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

  const handleSave = async (affair: CurrentAffairsItem) => {
    try {
      if (!user) {
        toast.error('You need to login to bookmark.')
        return
      }
      console.log('adding bookmark')
      await toggleBookmark(affair.id, !affair.bookmarked)
      toast.success(
        affair.bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
        affair.bookmarked ? 'Current affairs removed from your saved items' : 'Current affairs added to your saved items'
      )
    } catch (err) {
      toast.error('Failed to update bookmark', 'Please try again')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-4">Current Affairs</h1>
            <p className="text-lg text-muted-foreground">
              Stay updated with the latest current affairs relevant for UPSC Civil Services Examination 2025.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showBookmarked}
                onChange={() => setShowBookmarked(v => !v)}
                className="form-checkbox h-5 w-5 text-primary rounded"
              />
              <span className="ml-2 text-sm">Show Bookmarked Only</span>
            </label>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 p-6 bg-card rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search Current Affairs
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
            <div>
              <label htmlFor="importance" className="block text-sm font-medium mb-2">
                Importance
              </label>
              <select
                id="importance"
                value={selectedImportance}
                onChange={(e) => setSelectedImportance(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {importanceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Current Affairs Grid */}
        <div className="space-y-6">
          {filteredAffairs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No current affairs found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          ) : (
            filteredAffairs.map((affair) => (
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
                    ) :null}
                    <button
                      onClick={() => handleSave(affair)}
                      className={`p-2 rounded-full border border-input bg-background hover:bg-accent transition-colors ${affair.bookmarked ? 'text-yellow-500' : 'text-gray-400'}`}
                      title={affair.bookmarked ? 'Remove Bookmark' : 'Bookmark'}
                    >
                      {affair.bookmarked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5Z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5Z" /></svg>
                      )}
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

        {/* Additional Information */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">How to Use Current Affairs for UPSC</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">📚 Study Strategy</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Read daily current affairs from reliable sources</li>
                <li>• Connect current events with static syllabus topics</li>
                <li>• Make notes with multiple perspectives</li>
                <li>• Practice answer writing with current affairs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">🎯 Important Sources</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• The Hindu, Indian Express (Editorials)</li>
                <li>• PIB, PRS Legislative Research</li>
                <li>• Government websites and reports</li>
                <li>• Economic Survey and Budget documents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentAffairsPage 