import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePYQData } from '@/hooks/usePYQData'

const PYQPage = () => {
  const navigate = useNavigate()
  const { pyqData, loading, error } = usePYQData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  // Transform Supabase data to match the expected format
  const pyqYears = pyqData.map(item => ({
    year: item.year,
    title: item.title,
    paper: item.paper,
    status: item.status,
    questionPaperUrl: item.question_paper_url,
    answerKeyUrl: item.answer_key_url
  }))

  // Filter papers based on search term and selected year
  const filteredPapers = useMemo(() => {
    return pyqYears.filter((paper) => {
      const matchesSearch = searchTerm === '' || 
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.year.toString().includes(searchTerm)
      
      const matchesYear = selectedYear === '' || 
        paper.year.toString() === selectedYear
      
      return matchesSearch && matchesYear
    })
  }, [pyqYears, searchTerm, selectedYear])

  // Debug logging
  console.log('PYQ Data from Supabase:', pyqData)
  console.log('Transformed PYQ Years:', pyqYears)
  console.log('Filtered Papers:', filteredPapers)

  // Test Supabase connection
  useEffect(() => {
    console.log('Environment variables check:')
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
  }, [])

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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading PYQ data: {error}</p>
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

  // Function to download files
  const downloadFile = async (url: string, filename: string) => {
    try {
      // Fetch the PDF file
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Convert the response to a blob
      const blob = await response.blob()
      
      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'
      
      // Append to body, click, and cleanup
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: open in new tab if download fails
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Previous Year Question Papers</h1>
          <p className="text-lg text-muted-foreground">
            Access previous year UPSC Civil Services Examination question papers to enhance your preparation.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 p-6 bg-card rounded-lg border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search Papers
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by year, subject, or paper type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <div className="md:w-48">
              <label htmlFor="filter" className="block text-sm font-medium mb-2">
                Filter by Year
              </label>
              <select
                id="filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
                <option value="2017">2017</option>
              </select>
            </div>
          </div>
        </div>

        {/* PYQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPapers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No papers found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          ) : (
            filteredPapers.map((pyq) => (
            <div
              key={pyq.year+pyq.paper}
              className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{pyq.title}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {pyq.status}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {pyq.paper}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pyq.year} Examination
                </div>
              </div>

                            <div className="flex space-x-2">
                <button 
                  onClick={() => navigate(`/question-paper/${pyq.year}/${pyq.paper}`)}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Question Paper
                </button>
                <button 
                  onClick={() => downloadFile(pyq.answerKeyUrl, `${pyq.title}_${pyq.paper}_Answer_Key.pdf`)}
                  className="px-3 py-2 border border-input hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                >
                  Answer Key
                </button>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">How to Use Previous Year Papers</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">📚 Study Strategy</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Analyze question patterns and trends</li>
                <li>• Identify frequently asked topics</li>
                <li>• Practice time management</li>
                <li>• Understand the difficulty level</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">🎯 Preparation Tips</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Solve papers under exam conditions</li>
                <li>• Review answers and explanations</li>
                <li>• Focus on weak areas</li>
                <li>• Track your progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PYQPage 