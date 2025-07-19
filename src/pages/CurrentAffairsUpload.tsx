import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface CurrentAffairsItem {
  id?: number
  title: string
  summary: string
  category: string
  date: string
  source: string
  source_url?: string
  importance: 'High' | 'Medium' | 'Low'
  tags: string[]
  bookmarked?: boolean
  created_at?: string
  updated_at?: string
}

const CurrentAffairsUpload = () => {
  const [currentAffairsData, setCurrentAffairsData] = useState<CurrentAffairsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const toast = useToast()
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    category: '',
    date: '',
    source: '',
    source_url: '',
    importance: 'Medium' as 'High' | 'Medium' | 'Low',
    tags: ''
  })

  const categories = [
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

  const importanceLevels = ['High', 'Medium', 'Low']

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

      setCurrentAffairsData(data || [])
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

      if (error) {
        throw error
      }

      // Refresh the data
      await fetchCurrentAffairs()
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add current affairs entry')
      console.error('Error adding current affairs entry:', err)
      throw err
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Parse tags from comma-separated string
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      const entry = {
        title: formData.title,
        summary: formData.summary,
        category: formData.category,
        date: formData.date,
        source: formData.source,
        source_url: formData.source_url || undefined,
        importance: formData.importance,
        tags: tags
      }

      if (editingId) {
        await updateCurrentAffairsEntry(editingId, entry)
        setEditingId(null)
        toast.success('Current affairs entry updated successfully!')
      } else {
        await addCurrentAffairsEntry(entry)
        toast.success('Current affairs entry added successfully!')
      }
      
      // Reset form
      setFormData({
        title: '',
        summary: '',
        category: '',
        date: '',
        source: '',
        source_url: '',
        importance: 'Medium',
        tags: ''
      })
    } catch (err) {
      console.error('Error saving current affairs entry:', err)
      toast.error('Failed to save current affairs entry', 'Please try again')
    }
  }

  const handleEdit = (entry: CurrentAffairsItem) => {
    setEditingId(entry.id!)
    setFormData({
      title: entry.title,
      summary: entry.summary,
      category: entry.category,
      date: entry.date,
      source: entry.source,
      source_url: entry.source_url || '',
      importance: entry.importance,
      tags: entry.tags.join(', ')
    })
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this current affairs entry?')) {
      try {
        await deleteCurrentAffairsEntry(id)
        toast.success('Current affairs entry deleted successfully!')
      } catch (err) {
        console.error('Error deleting current affairs entry:', err)
        toast.error('Failed to delete current affairs entry', 'Please try again')
      }
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      title: '',
      summary: '',
      category: '',
      date: '',
      source: '',
      source_url: '',
      importance: 'Medium',
      tags: ''
    })
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

  // Initialize data on mount
  useEffect(() => {
    fetchCurrentAffairs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading current affairs data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Current Affairs Manager</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage current affairs content for UPSC preparation.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Current Affairs Entry' : 'Add New Current Affairs Entry'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter current affairs title"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-2">
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="importance" className="block text-sm font-medium mb-2">
                  Importance
                </label>
                <select
                  id="importance"
                  value={formData.importance}
                  onChange={(e) => setFormData({ ...formData, importance: e.target.value as 'High' | 'Medium' | 'Low' })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {importanceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" className="block text-sm font-medium mb-2">
                  Source *
                </label>
                <input
                  id="source"
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., The Hindu, PIB, Ministry of External Affairs"
                />
              </div>
              <div>
                <label htmlFor="source_url" className="block text-sm font-medium mb-2">
                  Source URL
                </label>
                <input
                  id="source_url"
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://example.com/article"
                />
              </div>
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium mb-2">
                Summary *
              </label>
              <textarea
                id="summary"
                required
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter a brief summary of the current affairs"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-2">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter tags separated by commas (e.g., Space, Technology, ISRO)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                {editingId ? 'Update Entry' : 'Add Entry'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-input bg-background px-4 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Data Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Current Affairs Data</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Importance</th>
                  <th className="text-left p-4 font-medium">Source</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAffairsData.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{entry.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {entry.summary.length > 100 
                            ? `${entry.summary.substring(0, 100)}...` 
                            : entry.summary
                          }
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{entry.category}</td>
                    <td className="p-4">{formatDate(entry.date)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getImportanceColor(entry.importance)}`}>
                        {entry.importance}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{entry.source}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id!)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentAffairsUpload 