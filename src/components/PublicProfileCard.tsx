import React from 'react'
import { User } from 'lucide-react'

interface PublicProfileCardProps {
  user: {
    id: string
    email?: string
    display_name?: string
    about?: string
    expert_subject?: string
    target_year?: string
    preparing_since?: string
    photo_url?: string
    created_at?: string
  }
  showDetails?: boolean
}

const PublicProfileCard: React.FC<PublicProfileCardProps> = ({ user, showDetails = false }) => {
  const displayName = user.display_name || user.email?.split('@')[0] || 'User'
  const photoUrl = user.photo_url

  return (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-12 h-12">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={displayName} 
              className="w-12 h-12 rounded-full object-cover border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-foreground">{displayName}</h3>
          {user.expert_subject && (
            <p className="text-sm text-muted-foreground">Expert in {user.expert_subject}</p>
          )}
        </div>
      </div>

      {showDetails && user.about && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {user.about}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        {user.target_year && (
          <span className="bg-primary/10 text-primary px-2 py-1 rounded">
            Target: {user.target_year}
          </span>
        )}
        {user.preparing_since && (
          <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
            Since: {user.preparing_since}
          </span>
        )}
      </div>
    </div>
  )
}

export default PublicProfileCard 