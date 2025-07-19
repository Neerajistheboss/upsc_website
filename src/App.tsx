import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import HomePage from '@/pages/HomePage'
import PYQPage from '@/pages/PYQPage'
import QuestionPaperViewer from '@/pages/QuestionPaperViewer'
import AnswerKeyViewer from '@/pages/AnswerKeyViewer'
import PDFUrlManager from '@/pages/PDFUrlManager'
import CurrentAffairsPage from '@/pages/CurrentAffairsPage'
import CurrentAffairsUpload from '@/pages/CurrentAffairsUpload'
import SpeciesInNewsPage from '@/pages/SpeciesInNewsPage'
import SpeciesManagementPage from '@/pages/SpeciesManagementPage'
import BookmarksPage from '@/pages/BookmarksPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfilePage from '@/pages/ProfilePage'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ui/theme-provider'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pyq" element={<PYQPage />} />
            <Route path="/question-paper/:year/:paper" element={<QuestionPaperViewer />} />
            <Route path="/answer-key/:year/:paper" element={<AnswerKeyViewer />} />
            <Route path="/admin/pdf-urls" element={<PDFUrlManager />} />
            <Route path="/current-affairs" element={<CurrentAffairsPage />} />
            <Route path="/species-in-news" element={<SpeciesInNewsPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/admin/current-affairs" element={<CurrentAffairsUpload />} />
            <Route path="/admin/species" element={<SpeciesManagementPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
