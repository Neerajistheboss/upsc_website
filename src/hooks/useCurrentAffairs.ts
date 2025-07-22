import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface CurrentAffairsItem {
  id: number
  title: string
  summary: string
  category: string
  date: string
  source: string
  source_url?: string
  importance: 'High' | 'Medium' | 'Low'
  tags: string[]
  bookmarked: boolean
  created_at: string
  updated_at: string
}

export const useCurrentAffairs = () => {
  const [currentAffairsData, setCurrentAffairsData] = useState<CurrentAffairsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch all current affairs data
  const fetchCurrentAffairs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('current_affairs')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      let affairs = data || []
      // If user is authenticated, fetch bookmarks for this user
      if (user) {
        const { data: bookmarks, error: bmError } = await supabase
          .from('bookmarks')
          .select('bookmark_id')
          .eq('user_id', user.id)
          .eq('type', 'current_affairs')
        if (bmError) throw bmError
        const bookmarkedIds = new Set((bookmarks || []).map(b => parseInt(b.bookmark_id)))
        affairs = affairs.map((item: any) => ({ ...item, bookmarked: bookmarkedIds.has(item.id) }))
      } else {
        affairs = affairs.map((item: any) => ({ ...item, bookmarked: false }))
      }
      setCurrentAffairsData(affairs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current affairs data')
      console.error('Error fetching current affairs data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new current affairs entry
  const addCurrentAffairsEntry = async (entry: Omit<CurrentAffairsItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('current_affairs')
        .insert([entry])
        .select()

   

      // Refresh the data
      await fetchCurrentAffairs()
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add current affairs entry')
      console.error('Error adding current affairs entry:', err)
      if (error?.code === '23505') {
        toast.error('You have already added this current affairs entry')
      }
    }
  }

  // Update current affairs entry
  const updateCurrentAffairsEntry = async (id: number, updates: Partial<CurrentAffairsItem>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('current_affairs')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        throw error
      }

      // Refresh the data
      await fetchCurrentAffairs()
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update current affairs entry')
      console.error('Error updating current affairs entry:', err)
      throw err
    }
  }

  // Delete current affairs entry
  const deleteCurrentAffairsEntry = async (id: number) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('current_affairs')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      // Refresh the data
      await fetchCurrentAffairs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete current affairs entry')
      console.error('Error deleting current affairs entry:', err)
      throw err
    }
  }

  // Toggle bookmark status
  const toggleBookmark = async (id: number, bookmarked: boolean) => {
    try {
      setError(null)
      if (!user) {
        throw new Error('You must be logged in to bookmark.')
      }
      if (bookmarked) {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            bookmark_id: id.toString(),
            type: 'current_affairs',
          })
        if (error) throw error
      } else {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('bookmark_id', id.toString())
          .eq('type', 'current_affairs')
        if (error) throw error
      }
      // Update local state for immediate feedback
      setCurrentAffairsData(prev => prev.map(item =>
        item.id === id ? { ...item, bookmarked } : item
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle bookmark')
      console.error('Error toggling bookmark:', err)
      throw err
    }
  }

  // Get current affairs by category
  const getCurrentAffairsByCategory = (category: string) => {
    return currentAffairsData.filter(item => item.category === category)
  }

  // Get current affairs by importance
  const getCurrentAffairsByImportance = (importance: string) => {
    return currentAffairsData.filter(item => item.importance === importance)
  }

  // Search current affairs
  const searchCurrentAffairs = (searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    return currentAffairsData.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.summary.toLowerCase().includes(term) ||
      item.tags.some(tag => tag.toLowerCase().includes(term))
    )
  }

  // Initialize data on mount
  useEffect(() => {
    fetchCurrentAffairs()
  }, [])

  return {
    currentAffairsData,
    loading,
    error,
    fetchCurrentAffairs,
    addCurrentAffairsEntry,
    updateCurrentAffairsEntry,
    deleteCurrentAffairsEntry,
    toggleBookmark,
    getCurrentAffairsByCategory,
    getCurrentAffairsByImportance,
    searchCurrentAffairs
  }
} 