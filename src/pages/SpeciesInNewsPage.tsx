import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/contexts/AuthContext'

interface Species {
  id?: number
  name: string
  scientific_name: string
  common_name: string
  iucn_status: 'Extinct' | 'Extinct in the Wild' | 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened' | 'Least Concern' | 'Data Deficient' | 'Not Evaluated'
  cites_status: 'Appendix I' | 'Appendix II' | 'Appendix III' | 'Not Listed'
  wpa_status: 'Schedule I' | 'Schedule II' | 'Schedule III' | 'Schedule IV' | 'Schedule V' | 'Schedule VI' | 'Not Listed'
  habitat: string
  distribution: string
  threats: string[]
  conservation_efforts: string[]
  recent_news: string
  image_url?: string
  bookmarked?: boolean
  created_at?: string
  updated_at?: string
}

const SpeciesInNewsPage = () => {
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showBookmarked, setShowBookmarked] = useState(false)
  const toast = useToast()
  const { user } = useAuth()

  const iucnStatuses = [
    'Extinct', 'Extinct in the Wild', 'Critically Endangered', 'Endangered', 
    'Vulnerable', 'Near Threatened', 'Least Concern', 'Data Deficient', 'Not Evaluated'
  ]

  const citesStatuses = ['Appendix I', 'Appendix II', 'Appendix III', 'Not Listed']
  const wpaStatuses = ['Schedule I', 'Schedule II', 'Schedule III', 'Schedule IV', 'Schedule V', 'Schedule VI', 'Not Listed']

  // Fetch all species data
  const fetchSpecies = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('species_in_news')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      setSpecies(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch species data')
      console.error('Error fetching species data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Toggle bookmark for a species
  const toggleBookmark = async (id: number, current: boolean | undefined) => {
    try {
      if (!user) {
        toast.error('You must be logged in to bookmark.')
        return
      }
      if (!current) {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            bookmark_id: id.toString(),
            type: 'species',
          })
        if (error) throw error
      } else {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('bookmark_id', id.toString())
          .eq('type', 'species')
        if (error) throw error
      }
      setSpecies((prev) => prev.map(s => s.id === id ? { ...s, bookmarked: !current } : s))
      toast.success(!current ? 'Bookmarked!' : 'Bookmark removed')
    } catch (err) {
      toast.error('Failed to update bookmark')
    }
  }

  // Filter species based on search term, status, and bookmark toggle
  const filteredSpecies = species.filter(specie => {
    if (showBookmarked && !specie.bookmarked) return false
    const matchesSearch = specie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specie.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specie.common_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         specie.iucn_status === filterStatus ||
                         specie.cites_status === filterStatus ||
                         specie.wpa_status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string, type: 'iucn' | 'cites' | 'wpa') => {
    switch (type) {
      case 'iucn':
        switch (status) {
          case 'Extinct':
          case 'Extinct in the Wild':
            return 'bg-gray-100 text-gray-800 border-gray-200'
          case 'Critically Endangered':
            return 'bg-red-100 text-red-800 border-red-200'
          case 'Endangered':
            return 'bg-orange-100 text-orange-800 border-orange-200'
          case 'Vulnerable':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
          case 'Near Threatened':
            return 'bg-blue-100 text-blue-800 border-blue-200'
          case 'Least Concern':
            return 'bg-green-100 text-green-800 border-green-200'
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
        }
      case 'cites':
        switch (status) {
          case 'Appendix I':
            return 'bg-red-100 text-red-800 border-red-200'
          case 'Appendix II':
            return 'bg-orange-100 text-orange-800 border-orange-200'
          case 'Appendix III':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
        }
      case 'wpa':
        switch (status) {
          case 'Schedule I':
            return 'bg-red-100 text-red-800 border-red-200'
          case 'Schedule II':
            return 'bg-orange-100 text-orange-800 border-orange-200'
          case 'Schedule III':
          case 'Schedule IV':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
          case 'Schedule V':
          case 'Schedule VI':
            return 'bg-blue-100 text-blue-800 border-blue-200'
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
        }
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Initialize data on mount
  useEffect(() => {
    fetchSpecies()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading species data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-4">Species in News</h1>
            <p className="text-muted-foreground">
              Important species for UPSC preparation with their conservation statuses.
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search Species
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search by name, scientific name, or common name..."
              />
            </div>
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium mb-2">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Statuses</option>
                <optgroup label="IUCN Status">
                  {iucnStatuses.map((status) => (
                    <option key={`iucn-${status}`} value={status}>
                      IUCN: {status}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="CITES Status">
                  {citesStatuses.map((status) => (
                    <option key={`cites-${status}`} value={status}>
                      CITES: {status}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="WPA Status">
                  {wpaStatuses.map((status) => (
                    <option key={`wpa-${status}`} value={status}>
                      WPA: {status}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Species Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecies.map((specie) => {
            const isExpanded = expandedId === specie.id;
            return (
              <div key={specie.id} className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative">
                {/* Bookmark Button */}
                <button
                  className={`absolute top-2 right-2 z-10 p-2 rounded-full border border-input bg-background hover:bg-accent transition-colors ${specie.bookmarked ? 'text-yellow-500' : 'text-gray-400'}`}
                  title={specie.bookmarked ? 'Remove Bookmark' : 'Bookmark'}
                  onClick={() => toggleBookmark(specie.id!, specie.bookmarked)}
                >
                  {specie.bookmarked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5Z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5Z" /></svg>
                  )}
                </button>
                {/* Image */}
                <div className="h-40 bg-muted flex items-center justify-center relative">
                  {specie.image_url ? (
                    <img
                      src={specie.image_url}
                      alt={specie.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class='flex items-center justify-center w-full h-full'>
                              <svg class='w-16 h-16 text-muted-foreground' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'></path>
                              </svg>
                            </div>
                          `
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <svg className="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                {/* Compact view for mobile */}
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{specie.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(specie.iucn_status, 'iucn')}`}>{specie.iucn_status}</span>
                    <button
                      className="md:hidden px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : specie.id!)}
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  {/* Expanded details (always visible on md+, toggle on mobile) */}
                  <div className={`transition-all duration-200 ease-in-out ${isExpanded ? 'block' : 'hidden'} md:block`}>
                    <p className="text-sm text-muted-foreground italic mb-2">{specie.scientific_name}</p>
                    {specie.common_name && (
                      <p className="text-sm text-muted-foreground mb-4">Common: {specie.common_name}</p>
                    )}
                    {/* Status Badges */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">CITES:</span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(specie.cites_status, 'cites')}`}>{specie.cites_status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">WPA:</span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(specie.wpa_status, 'wpa')}`}>{specie.wpa_status}</span>
                      </div>
                    </div>
                    {/* Habitat & Distribution */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Habitat:</h4>
                      <p className="text-sm text-muted-foreground">{specie.habitat}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Distribution:</h4>
                      <p className="text-sm text-muted-foreground">{specie.distribution}</p>
                    </div>
                    {/* Threats */}
                    {specie.threats && specie.threats.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Threats:</h4>
                        <div className="flex flex-wrap gap-1">
                          {specie.threats.map((threat, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-full">{threat}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Conservation Efforts */}
                    {specie.conservation_efforts && specie.conservation_efforts.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Conservation Efforts:</h4>
                        <div className="flex flex-wrap gap-1">
                          {specie.conservation_efforts.map((effort, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-full">{effort}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Recent News */}
                    {specie.recent_news && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Recent News:</h4>
                        <p className="text-sm text-muted-foreground">{specie.recent_news.length > 150 ? `${specie.recent_news.substring(0, 150)}...` : specie.recent_news}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredSpecies.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No species found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpeciesInNewsPage 