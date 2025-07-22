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
import AuthCallback from '@/pages/AuthCallback'
import ProfilePage from '@/pages/ProfilePage'
import CommunityPage from '@/pages/CommunityPage'
import StudentsPage from '@/pages/StudentsPage'
import QuestionPaperUpload from '@/pages/QuestionPaperUpload'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import PWAInstallButton from '@/components/PWAInstallButton'
import AdminRoute from '@/components/AdminRoute'
import DailyTargetPage from '@/pages/DailyTargetPage'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pyq" element={<PYQPage />} />
              <Route path="/question-paper/:year/:paper" element={<QuestionPaperViewer />} />
              <Route path="/answer-key/:year/:paper" element={<AnswerKeyViewer />} />
              <Route path="/admin/pdf-urls" element={<AdminRoute><PDFUrlManager /></AdminRoute>} />
              <Route path="/current-affairs" element={<CurrentAffairsPage />} />
              <Route path="/species-in-news" element={<SpeciesInNewsPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/admin/current-affairs" element={<AdminRoute><CurrentAffairsUpload /></AdminRoute>} />
              <Route path="/admin/species" element={<AdminRoute><SpeciesManagementPage /></AdminRoute>} />
              <Route path="/admin/upload-question-paper" element={<AdminRoute><QuestionPaperUpload /></AdminRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/daily-targets" element={<DailyTargetPage />} />
            </Routes>
            <Toaster />
            <div className='hidden md:block fixed z-50 bottom-4 left-4 '><PWAInstallButton /></div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
