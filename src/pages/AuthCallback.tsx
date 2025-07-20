import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const AuthCallback = () => {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Wait for auth to be initialized
      if (authLoading) return

      if (user) {
        navigate('/')
      } else {
        navigate('/login')
      }
      setLoading(false)
    }

    handleAuthCallback()
  }, [navigate, user, authLoading])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Authenticating...</h2>
        {loading && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <p className="text-muted-foreground mt-4">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  )
}

export default AuthCallback 