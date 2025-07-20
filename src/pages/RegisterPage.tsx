import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { z } from 'zod'
import GoogleLoginButton from '@/components/GoogleLoginButton'

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(8, { message: 'Phone number is too short' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
}).superRefine(({ password, confirmPassword }, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    })
  }
})

const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<{ [k: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    try {
      schema.parse(form)
      setErrors({})
      return {}
    } catch (err: any) {
      const fieldErrors: { [k: string]: string } = {}
      if (err.errors) {
        for (const e of err.errors) {
          if (e.message === 'Passwords do not match') {
            fieldErrors['confirmPassword'] = e.message
          } else {
            fieldErrors[e.path[0]] = e.message
          }
        }
      }
      setErrors(fieldErrors)
      return fieldErrors
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => {
      const updated = { ...prev, [name]: value }
      // Always validate the whole form on any change
      try {
        schema.parse(updated)
        setErrors({})
      } catch (err: any) {
        const fieldErrors: { [k: string]: string } = {}
        if (err.errors) {
          for (const e of err.errors) {
            // Always map password mismatch error to confirmPassword
            if (e.message === 'Passwords do not match') {
              fieldErrors['confirmPassword'] = e.message
            } else {
              fieldErrors[e.path[0]] = e.message
            }
          }
        }
        setErrors(fieldErrors)
      }
      return updated
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      const firstError = Object.values(fieldErrors)[0]
      if (firstError) {
        // We'll handle this error display differently since we don't have toast here
        console.error(firstError)
        return
      }
      return
    }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.phone)
      navigate('/login')
    } catch (err: any) {
      // Error handling is already done in the context
      console.error('Signup error:', err)
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
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        
        {/* Google Login Button */}
        <GoogleLoginButton 
          variant="register" 
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

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
            {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
          </div>
          <div>
            <label className="block text-sm mb-1">Phone Number</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
            {errors.phone && <div className="text-red-600 text-xs mt-1">{errors.phone}</div>}
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
            {errors.password && <div className="text-red-600 text-xs mt-1">{errors.password}</div>}
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
            {errors.confirmPassword && <div className="text-red-600 text-xs mt-1">{errors.confirmPassword}</div>}
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors" disabled={loading}>
            {loading ? 'Please wait...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage 