import React from 'react'
import { useIsLoggedIn, useUser, useAuthLoading } from '@/contexts/AuthContext'

const AuthStatus: React.FC = () => {
  const isLoggedIn = useIsLoggedIn()
  const user = useUser()
  const loading = useAuthLoading()

  if (loading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Loading authentication status...</p>
      </div>
    )
  }

  if (isLoggedIn && user) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-800">
          ✅ Logged in as: {user.email || user.user_metadata?.full_name || 'User'}
        </p>
        <p className="text-sm text-green-600 mt-1">
          User ID: {user.id}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-800">❌ Not logged in</p>
    </div>
  )
}

export default AuthStatus 