import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePYQData } from '@/hooks/usePYQData'

const AnswerKeyViewer = () => {
  const { year, paper } = useParams()
  const navigate = useNavigate()
  const { pyqData, loading: dataLoading, error } = usePYQData()
  const [pdfUrl, setPdfUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [iframeFailed, setIframeFailed] = useState(false)

  useEffect(() => {
    if (year && paper && pyqData.length > 0) {
      // Find the matching PYQ entry from Supabase data
      const matchingPaper = pyqData.find(p => 
        p.year.toString() === year && p.paper === paper
      )
      
      if (matchingPaper) {
        setPdfUrl(matchingPaper.answer_key_url)
      } else {
        // Fallback URL if not found
        setPdfUrl(`https://upsc.gov.in/sites/default/files/CS_P_${year}_English_AK.pdf`)
      }
      
      setLoading(false)
     
    }
  }, [year, paper, pyqData])

  const handleBack = () => {
    navigate('/pyq')
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `UPSC_CSE_PRE_${year}_${paper}_Answer_Key.pdf`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (dataLoading) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading answer key...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to PYQ
              </button>
              <div className="h-6 w-px bg-border"></div>
              <h1 className="text-lg font-semibold">
                UPSC CSE PRE {year} - {paper} Answer Key
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="h-[calc(100vh-4rem)] relative">
        {!iframeFailed ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={`UPSC CSE PRE ${year} ${paper} Answer Key`}
            onLoad={() => setIframeFailed(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-background flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Answer Key Not Available</h3>
                <p className="text-muted-foreground mb-4">
                  The answer key could not be loaded directly. This might be due to CORS restrictions or the file not being publicly accessible.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.open(pdfUrl, '_blank')}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </button>
                
                <button
                  onClick={handleDownload}
                  className="w-full border border-input bg-background hover:bg-accent px-4 py-2 rounded flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Answer Key
                </button>
                
                <button
                  onClick={() => navigate('/pyq')}
                  className="w-full border border-input bg-background hover:bg-accent px-4 py-2 rounded flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to PYQ List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnswerKeyViewer 