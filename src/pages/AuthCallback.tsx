import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

const AuthCallback = () => {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (data.session) {
          toast.success('Successfully authenticated!')
          navigate('/')
        } else {
          toast.error('Authentication failed')
          navigate('/login')
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        toast.error(err.message || 'Authentication failed')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate, toast])

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