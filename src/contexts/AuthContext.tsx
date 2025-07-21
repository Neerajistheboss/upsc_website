import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoggedIn: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const isLoggedIn = !!user
  const wasLoggedIn = useRef(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        wasLoggedIn.current = !!session?.user
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Show appropriate toast messages
        if (event === 'SIGNED_IN') {
          if (!wasLoggedIn.current) {
            toast.success('Successfully logged in!')
          }
          wasLoggedIn.current = true;
          // For new Google OAuth users, set publicAccount to true by default and sync to public_profiles
          if (session?.user && event === 'SIGNED_IN' && session.user.app_metadata?.provider === 'google') {
            const currentMetadata = session.user.user_metadata || {}
            if (currentMetadata.publicAccount === undefined) {
              try {
                // Update user metadata
                await supabase.auth.updateUser({
                  data: {
                    ...currentMetadata,
                    publicAccount: true
                  }
                })
                // Add to public_profiles table
                await supabase
  .from('public_profiles')
  .upsert({
    id: session.user.id,
    email: session.user.email,
    display_name: currentMetadata.displayName || session.user.email?.split('@')[0],
    about: currentMetadata.about || '',
    expert_subject: currentMetadata.expertSubject || '',
    target_year: currentMetadata.targetYear || '',
    preparing_since: currentMetadata.preparingSince || '',
    photo_url: currentMetadata.photoUrl || currentMetadata.avatar_url || currentMetadata.picture || ''
  }, { onConflict: 'id' })
              } catch (error) {
                console.error('Error setting default public account for Google user:', error)
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          toast.success('Successfully logged out!')
          wasLoggedIn.current = false;
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [toast])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            publicAccount: true // Make profile public by default
          }
        }
      })
      if (error) throw error
      toast.success('Signup successful! Please check your email to verify.')
    } catch (error: any) {
      toast.error(error.message || 'Signup failed')
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Logout failed')
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      toast.success('Google login initiated!')
    } catch (error: any) {
      toast.error(error.message || 'Google login failed')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isLoggedIn,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export individual hooks for specific use cases
export const useIsLoggedIn = (): boolean => {
  const { isLoggedIn } = useAuth()
  return isLoggedIn
}

export const useUser = (): User | null => {
  const { user } = useAuth()
  return user
}

export const useAuthLoading = (): boolean => {
  const { loading } = useAuth()
  return loading
} 