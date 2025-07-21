import React from 'react'
import { User } from 'lucide-react'
import { ConnectButton } from '@/components/ConnectButton'

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
    photo_supabase_id?: string
    created_at?: string
  }
  showDetails?: boolean
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const PublicProfileCard: React.FC<PublicProfileCardProps> = ({ 
  user, 
  showDetails = false
}) => {
  function maskString(str: string) {
    if (str.length <= 5) return str; // Nothing to mask
    const start = str.slice(0, 5);
    const end = str.slice(-2);
    const masked = '*'.repeat(str.length - 5);
    return `${start}${masked}${end}`;
  }
  const displayName = maskString(user.display_name || ''  ) || maskString(user.email || ''  ) || 'User'
  
  let photoUrl = user.photo_url;
  if (user.photo_supabase_id) {
    // Construct the public URL for the profile-photos bucket
    photoUrl = `${supabaseUrl}/storage/v1/object/public/profile-pics/${user.photo_supabase_id}`;
    console.log(photoUrl)
  }

  console.log(user.display_name, user.email)
  console.log(photoUrl)

  console.log('RENDERING PUBLIC PROFILE CARD')

  return (
    <div className="group relative bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with avatar and name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-0.5">
              {/* If user has a photo_url (Google login or uploaded), show it. Otherwise, show default icon. */}
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={displayName} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
              {displayName}
            </h3>
            {user.expert_subject && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <p className="text-sm text-muted-foreground font-medium">
                  Expert in {user.expert_subject}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* About section */}
        {showDetails && user.about && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {user.about}
            </p>
          </div>
        )}

        {/* Stats and badges */}
        <div className="space-y-3">
          {/* Progress indicators */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {user.target_year && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Target: {user.target_year}</span>
              </div>
            )}
            {user.preparing_since && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                <span>Since: {user.preparing_since}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs fontium py-2 px-3 rounded-lg transition-colors duration-200">
              View Profile
            </button>
            <div>
            {/* <ConnectButton 
          targetUserId={user.id}
          targetUserName={displayName}
          className="flex-1"
          /> */}
          </div>
          </div>
        </div>
      </div>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-xl" />
    </div>
  )
}

export default PublicProfileCard 