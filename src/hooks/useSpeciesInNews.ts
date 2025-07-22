import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import type { SpeciesInNewsItem } from './useCurrentAffairs'

export const useSpeciesInNews = () => {
  const [speciesData, setSpeciesData] = useState<SpeciesInNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch all species in news data
  const fetchSpeciesInNews = async () => {
    try {
      setLoading(true)
      setError(null)
      let { data, error } = await supabase
        .from('species_in_news')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      let species = data || []
      // If user is authenticated, fetch bookmarks for this user
      if (user) {
        const { data: bookmarks, error: bmError } = await supabase
          .from('bookmarks')
          .select('bookmark_id')
          .eq('user_id', user.id)
          .eq('type', 'species')
        if (bmError) throw bmError
        const bookmarkedIds = new Set((bookmarks || []).map(b => parseInt(b.bookmark_id)))
        species = species.map((item: any) => ({ ...item, bookmarked: bookmarkedIds.has(item.id) }))
      } else {
        species = species.map((item: any) => ({ ...item, bookmarked: false }))
      }
      setSpeciesData(species)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch species data')
      console.error('Error fetching species data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Toggle bookmark status
  const toggleBookmark = async (id: number, bookmarked: boolean) => {
    try {
      if (!user) {
        toast.error('You need to login to bookmark.')
        return
      }
      if (bookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('bookmark_id', id.toString())
          .eq('type', 'species')
        if (error) { console.log(error) }
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            bookmark_id: id.toString(),
            type: 'species',
          })
        if (error) { console.log(error) }
      }
      // Update local state for immediate feedback
      setSpeciesData(prev => prev.map(item =>
        item.id === id ? { ...item, bookmarked: !bookmarked } : item
      ))
    } catch (err) {
      toast.error('Failed to toggle bookmark')
      console.error('Error toggling bookmark:', err)
    }
  }

  // Search/filter helpers (optional, similar to useCurrentAffairs)
  const searchSpecies = (searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    return speciesData.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.scientific_name.toLowerCase().includes(term) ||
      item.common_name.toLowerCase().includes(term)
    )
  }

  useEffect(() => {
    fetchSpeciesInNews()
  }, [user?.id])

  return {
    speciesData,
    loading,
    error,
    fetchSpeciesInNews,
    toggleBookmark,
    searchSpecies,
  }
} 