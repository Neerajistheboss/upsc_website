import { useState, useEffect } from 'react'
import { supabase, PYQ_TABLE } from '@/lib/supabase'
import type { PYQData } from '@/lib/supabase'

export const usePYQData = () => {
  const [pyqData, setPyqData] = useState<PYQData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all PYQ data
  const fetchPYQData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from(PYQ_TABLE)
        .select('*')
        .order('year', { ascending: false })
        .order('paper', { ascending: true })

      if (error) {
        throw error
      }

      setPyqData(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PYQ data')
      console.error('Error fetching PYQ data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new PYQ entry
  const addPYQEntry = async (entry: Omit<PYQData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from(PYQ_TABLE)
        .insert([entry])
        .select()

      if (error) {
        throw error
      }

      // Refresh the data
      await fetchPYQData()
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add PYQ entry')
      console.error('Error adding PYQ entry:', err)
      throw err
    }
  }

  // Update PYQ entry
  const updatePYQEntry = async (id: number, updates: Partial<PYQData>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from(PYQ_TABLE)
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        throw error
      }

      // Refresh the data
      await fetchPYQData()
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update PYQ entry')
      console.error('Error updating PYQ entry:', err)
      throw err
    }
  }

  // Delete PYQ entry
  const deletePYQEntry = async (id: number) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from(PYQ_TABLE)
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      // Refresh the data
      await fetchPYQData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete PYQ entry')
      console.error('Error deleting PYQ entry:', err)
      throw err
    }
  }

  // Get PYQ entry by year and paper
  const getPYQEntry = (year: string, paper: string) => {
    return pyqData.find(entry => 
      entry.year.toString() === year && entry.paper === paper
    )
  }

  // Initialize data on mount
  useEffect(() => {
    fetchPYQData()
  }, [])

  return {
    pyqData,
    loading,
    error,
    fetchPYQData,
    addPYQEntry,
    updatePYQEntry,
    deletePYQEntry,
    getPYQEntry
  }
} 