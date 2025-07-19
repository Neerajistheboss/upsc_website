import { Badge } from '@/components/ui/badge'
import { Handshake } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const HomePage = () => {
  const [visitorCount, setVisitorCount] = useState<number | null>(null)
  const [loadingVisitor, setLoadingVisitor] = useState(true)

  useEffect(() => {
    const incrementVisitor = async () => {
      setLoadingVisitor(true)
      // Atomically increment the counter and get the new value
      const { data, error } = await supabase.rpc('increment_visitor_count')
      if (!error && data && typeof data === 'number') {
        setVisitorCount(data)
      } else {
        // fallback: fetch the count directly
        const { data: row } = await supabase.from('visitor_stats').select('visit_count').eq('id', 1).single()
        setVisitorCount(row?.visit_count || 0)
      }
      setLoadingVisitor(false)
    }
    incrementVisitor()
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to UPSC 2025</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive platform for UPSC Civil Services Examination preparation. 
            Access previous year papers, study materials, and practice tests all in one place.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row items-stretch gap-6 mb-12">
          
   
            {PreviousYearPapers}
            {CurrentAffairs}
        {Community}
            {PracticeTests}

        {/* Latest Updates */}
        </div>
      </div>
      {/* Visitor Counter */}
      <div className="mt-8 text-center text-muted-foreground text-sm">
        {loadingVisitor ? 'Loading visitors...' : `Total Visitors: ${visitorCount ?? 'N/A'}`}
      </div>
    </div>
  )
}

const PreviousYearPapers=<Link to="/pyq">
<div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  </div>
  <h3 className="text-xl font-semibold mb-2">Previous Year Papers</h3>
  <p className="text-muted-foreground">Access question papers from previous years to understand the exam pattern.</p>
</div>
</Link>

const CurrentAffairs=       <Link to="/current-affairs">
<div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  </div>
  <h3 className="text-xl font-semibold mb-2">Current Affairs</h3>
  <p className="text-muted-foreground">Stay updated with the latest current affairs to ace the exam.</p>
</div>
</Link>

const PracticeTests = <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer relative ">
<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
</div>
<h3 className="text-xl font-semibold mb-2">Practice Tests</h3>
<p className="text-muted-foreground">Take mock tests and practice questions to improve your performance.</p>
<Badge variant="outline" className='absolute top-4 right-4 bg-orange-500 text-white'>Coming Soon</Badge>
</div>

const Community = (
  <Link to="/students">
    <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer min-w-80 relative">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Handshake className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Student Community</h3>
      <p className="text-muted-foreground">
        Meet other public UPSC aspirants and share your journey.
      </p>
    </div>
  </Link>
);
export default HomePage 