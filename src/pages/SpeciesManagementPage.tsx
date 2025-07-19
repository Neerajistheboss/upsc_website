import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

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
  created_at?: string
  updated_at?: string
}

const SpeciesManagementPage = () => {
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    common_name: '',
    iucn_status: 'Least Concern' as Species['iucn_status'],
    cites_status: 'Not Listed' as Species['cites_status'],
    wpa_status: 'Not Listed' as Species['wpa_status'],
    habitat: '',
    distribution: '',
    threats: '',
    conservation_efforts: '',
    recent_news: '',
    image_url: ''
  })

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

  // Add new species
  const addSpecies = async (speciesData: Omit<Species, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('species_in_news')
        .insert([speciesData])
        .select()

      if (error) {
        throw error
      }

      await fetchSpecies()
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add species')
      console.error('Error adding species:', err)
      throw err
    }
  }

  // Update species
  const updateSpecies = async (id: number, updates: Partial<Species>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('species_in_news')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        throw error
      }

      await fetchSpecies()
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update species')
      console.error('Error updating species:', err)
      throw err
    }
  }

  // Delete species
  const deleteSpecies = async (id: number) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('species_in_news')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      await fetchSpecies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete species')
      console.error('Error deleting species:', err)
      throw err
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Parse arrays from comma-separated strings
      const threats = formData.threats.split(',').map(threat => threat.trim()).filter(threat => threat.length > 0)
      const conservation_efforts = formData.conservation_efforts.split(',').map(effort => effort.trim()).filter(effort => effort.length > 0)
      
      const speciesData = {
        name: formData.name,
        scientific_name: formData.scientific_name,
        common_name: formData.common_name,
        iucn_status: formData.iucn_status,
        cites_status: formData.cites_status,
        wpa_status: formData.wpa_status,
        habitat: formData.habitat,
        distribution: formData.distribution,
        threats: threats,
        conservation_efforts: conservation_efforts,
        recent_news: formData.recent_news,
        image_url: formData.image_url || undefined
      }

      if (editingId) {
        await updateSpecies(editingId, speciesData)
        setEditingId(null)
        toast.success('Species updated successfully!')
      } else {
        await addSpecies(speciesData)
        toast.success('Species added successfully!')
      }
      
      // Reset form
      setFormData({
        name: '',
        scientific_name: '',
        common_name: '',
        iucn_status: 'Least Concern',
        cites_status: 'Not Listed',
        wpa_status: 'Not Listed',
        habitat: '',
        distribution: '',
        threats: '',
        conservation_efforts: '',
        recent_news: '',
        image_url: ''
      })
    } catch (err) {
      console.error('Error saving species:', err)
      toast.error('Failed to save species', 'Please try again')
    }
  }

  const handleEdit = (speciesItem: Species) => {
    setEditingId(speciesItem.id!)
    setFormData({
      name: speciesItem.name,
      scientific_name: speciesItem.scientific_name,
      common_name: speciesItem.common_name,
      iucn_status: speciesItem.iucn_status,
      cites_status: speciesItem.cites_status,
      wpa_status: speciesItem.wpa_status,
      habitat: speciesItem.habitat,
      distribution: speciesItem.distribution,
      threats: speciesItem.threats.join(', '),
      conservation_efforts: speciesItem.conservation_efforts.join(', '),
      recent_news: speciesItem.recent_news,
      image_url: speciesItem.image_url || ''
    })
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this species?')) {
      try {
        await deleteSpecies(id)
        toast.success('Species deleted successfully!')
      } catch (err) {
        console.error('Error deleting species:', err)
        toast.error('Failed to delete species', 'Please try again')
      }
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      name: '',
      scientific_name: '',
      common_name: '',
      iucn_status: 'Least Concern',
      cites_status: 'Not Listed',
      wpa_status: 'Not Listed',
      habitat: '',
      distribution: '',
      threats: '',
      conservation_efforts: '',
      recent_news: '',
      image_url: ''
    })
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Species Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage species data for UPSC preparation.
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
            {editingId ? 'Edit Species' : 'Add New Species'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Species Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Bengal Tiger"
                />
              </div>

              <div>
                <label htmlFor="scientific_name" className="block text-sm font-medium mb-2">
                  Scientific Name *
                </label>
                <input
                  id="scientific_name"
                  type="text"
                  required
                  value={formData.scientific_name}
                  onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Panthera tigris tigris"
                />
              </div>

              <div>
                <label htmlFor="common_name" className="block text-sm font-medium mb-2">
                  Common Name
                </label>
                <input
                  id="common_name"
                  type="text"
                  value={formData.common_name}
                  onChange={(e) => setFormData({ ...formData, common_name: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Royal Bengal Tiger"
                />
              </div>

              <div>
                <label htmlFor="image_url" className="block text-sm font-medium mb-2">
                  Image URL
                </label>
                <input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="iucn_status" className="block text-sm font-medium mb-2">
                  IUCN Status
                </label>
                <select
                  id="iucn_status"
                  value={formData.iucn_status}
                  onChange={(e) => setFormData({ ...formData, iucn_status: e.target.value as Species['iucn_status'] })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {iucnStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cites_status" className="block text-sm font-medium mb-2">
                  CITES Status
                </label>
                <select
                  id="cites_status"
                  value={formData.cites_status}
                  onChange={(e) => setFormData({ ...formData, cites_status: e.target.value as Species['cites_status'] })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {citesStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="wpa_status" className="block text-sm font-medium mb-2">
                  WPA Status
                </label>
                <select
                  id="wpa_status"
                  value={formData.wpa_status}
                  onChange={(e) => setFormData({ ...formData, wpa_status: e.target.value as Species['wpa_status'] })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {wpaStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="habitat" className="block text-sm font-medium mb-2">
                  Habitat *
                </label>
                <textarea
                  id="habitat"
                  required
                  rows={3}
                  value={formData.habitat}
                  onChange={(e) => setFormData({ ...formData, habitat: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe the natural habitat of the species"
                />
              </div>

              <div>
                <label htmlFor="distribution" className="block text-sm font-medium mb-2">
                  Distribution *
                </label>
                <textarea
                  id="distribution"
                  required
                  rows={3}
                  value={formData.distribution}
                  onChange={(e) => setFormData({ ...formData, distribution: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe the geographical distribution"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="threats" className="block text-sm font-medium mb-2">
                  Threats
                </label>
                <input
                  id="threats"
                  type="text"
                  value={formData.threats}
                  onChange={(e) => setFormData({ ...formData, threats: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Habitat loss, Poaching, Climate change (separate with commas)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple threats with commas
                </p>
              </div>

              <div>
                <label htmlFor="conservation_efforts" className="block text-sm font-medium mb-2">
                  Conservation Efforts
                </label>
                <input
                  id="conservation_efforts"
                  type="text"
                  value={formData.conservation_efforts}
                  onChange={(e) => setFormData({ ...formData, conservation_efforts: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Protected areas, Breeding programs, Awareness campaigns (separate with commas)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple efforts with commas
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="recent_news" className="block text-sm font-medium mb-2">
                Recent News
              </label>
              <textarea
                id="recent_news"
                rows={4}
                value={formData.recent_news}
                onChange={(e) => setFormData({ ...formData, recent_news: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Recent news or developments related to this species"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                {editingId ? 'Update Species' : 'Add Species'}
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
            <h2 className="text-xl font-semibold">Species Data</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Scientific Name</th>
                  <th className="text-left p-4 font-medium">IUCN</th>
                  <th className="text-left p-4 font-medium">CITES</th>
                  <th className="text-left p-4 font-medium">WPA</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {species.map((specie) => (
                  <tr key={specie.id} className="border-t">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{specie.name}</div>
                        {specie.common_name && (
                          <div className="text-sm text-muted-foreground">
                            {specie.common_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm italic">{specie.scientific_name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${
                        specie.iucn_status === 'Critically Endangered' || specie.iucn_status === 'Endangered' 
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : specie.iucn_status === 'Vulnerable'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {specie.iucn_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${
                        specie.cites_status === 'Appendix I' 
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : specie.cites_status === 'Appendix II'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {specie.cites_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${
                        specie.wpa_status === 'Schedule I' 
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : specie.wpa_status === 'Schedule II'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {specie.wpa_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(specie)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(specie.id!)}
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

export default SpeciesManagementPage 