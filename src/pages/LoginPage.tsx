import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import GoogleLoginButton from '@/components/GoogleLoginButton'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: any) {
      // Error handling is already done in the context
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = () => {
    // Google login will redirect to auth callback, so we don't need to navigate here
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        
        {/* Google Login Button */}
        <GoogleLoginButton 
          variant="login" 
          onSuccess={handleGoogleSuccess}
          className="mb-4"
        />
        
        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors" disabled={loading}>
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary underline">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 