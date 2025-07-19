import React, { useState } from 'react'
import { usePYQData } from '@/hooks/usePYQData'
import type { PYQData } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

const PDFUrlManager = () => {
  const { pyqData, loading, error, addPYQEntry, updatePYQEntry, deletePYQEntry } = usePYQData()
  const [editingId, setEditingId] = useState<number | null>(null)
  const toast = useToast()
  const [formData, setFormData] = useState({
    year: '',
    title: '',
    paper: '',
    status: 'Available',
    question_paper_url: '',
    answer_key_url: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        await updatePYQEntry(editingId, {
          ...formData,
          year: parseInt(formData.year)
        })
        setEditingId(null)
        toast.success('PYQ entry updated successfully!')
      } else {
        await addPYQEntry({
          ...formData,
          year: parseInt(formData.year)
        })
        toast.success('PYQ entry added successfully!')
      }
      
      // Reset form
      setFormData({
        year: '',
        title: '',
        paper: '',
        status: 'Available',
        question_paper_url: '',
        answer_key_url: ''
      })
    } catch (err) {
      console.error('Error saving PYQ entry:', err)
      toast.error('Failed to save PYQ entry', 'Please try again')
    }
  }

  const handleEdit = (entry: PYQData) => {
    setEditingId(entry.id!)
    setFormData({
      year: entry.year.toString(),
      title: entry.title,
      paper: entry.paper,
      status: entry.status,
      question_paper_url: entry.question_paper_url,
      answer_key_url: entry.answer_key_url
    })
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deletePYQEntry(id)
        toast.success('PYQ entry deleted successfully!')
      } catch (err) {
        console.error('Error deleting PYQ entry:', err)
        toast.error('Failed to delete PYQ entry', 'Please try again')
      }
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      year: '',
      title: '',
      paper: '',
      status: 'Available',
      question_paper_url: '',
      answer_key_url: ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PYQ data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">PDF URL Manager</h1>
          <p className="text-muted-foreground">
            Manage question paper and answer key URLs for UPSC PYQ data.
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
            {editingId ? 'Edit PYQ Entry' : 'Add New PYQ Entry'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-2">
                  Year *
                </label>
                <input
                  id="year"
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="2024"
                />
              </div>

              <div>
                <label htmlFor="paper" className="block text-sm font-medium mb-2">
                  Paper *
                </label>
                <select
                  id="paper"
                  required
                  value={formData.paper}
                  onChange={(e) => setFormData({ ...formData, paper: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Paper</option>
                  <option value="GS">GS</option>
                  <option value="CSAT">CSAT</option>
                </select>
              </div>

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
                  placeholder="UPSC CSE PRE 2024"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Available">Available</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="question_paper_url" className="block text-sm font-medium mb-2">
                Question Paper URL *
              </label>
              <input
                id="question_paper_url"
                type="url"
                required
                value={formData.question_paper_url}
                onChange={(e) => setFormData({ ...formData, question_paper_url: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://upsc.gov.in/sites/default/files/..."
              />
            </div>

            <div>
              <label htmlFor="answer_key_url" className="block text-sm font-medium mb-2">
                Answer Key URL *
              </label>
              <input
                id="answer_key_url"
                type="url"
                required
                value={formData.answer_key_url}
                onChange={(e) => setFormData({ ...formData, answer_key_url: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://upsc.gov.in/sites/default/files/..."
              />
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
            <h2 className="text-xl font-semibold">Current PYQ Data</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Year</th>
                  <th className="text-left p-4 font-medium">Paper</th>
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Question Paper</th>
                  <th className="text-left p-4 font-medium">Answer Key</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pyqData.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="p-4">{entry.year}</td>
                    <td className="p-4">{entry.paper}</td>
                    <td className="p-4">{entry.title}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.status === 'Available' ? 'bg-green-100 text-green-800' :
                        entry.status === 'Coming Soon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <a
                        href={entry.question_paper_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </a>
                    </td>
                    <td className="p-4">
                      <a
                        href={entry.answer_key_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </a>
                    </td>
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

export default PDFUrlManager 