import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface PublicUser {
  id: string
  email?: string
  display_name?: string
  about?: string
  expert_subject?: string
  target_year?: string
  preparing_since?: string
  photo_url?: string
  created_at?: string
}

export const usePublicProfiles = () => {
  const [users, setUsers] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const fetchPublicProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch public profiles from the public_profiles table
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (err: any) {
      console.error('Error fetching public profiles:', err)
      setError(err.message || 'Failed to fetch profiles')
      toast.error('Failed to load community profiles')
    } finally {
      setLoading(false)
    }
  }

  const searchProfiles = async (query: string) => {
    try {
      setLoading(true)
      setError(null)

      const searchTerm = query.toLowerCase()
      
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .or(`display_name.ilike.%${searchTerm}%,expert_subject.ilike.%${searchTerm}%,about.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (err: any) {
      console.error('Error searching profiles:', err)
      setError(err.message || 'Failed to search profiles')
      toast.error('Failed to search profiles')
    } finally {
      setLoading(false)
    }
  }

  const filterByExpertSubject = async (subject: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('expert_subject', subject)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (err: any) {
      console.error('Error filtering profiles:', err)
      setError(err.message || 'Failed to filter profiles')
      toast.error('Failed to filter profiles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicProfiles()
  }, [])

  return {
    users,
    loading,
    error,
    fetchPublicProfiles,
    searchProfiles,
    filterByExpertSubject
  }
} 