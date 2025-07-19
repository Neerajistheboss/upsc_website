import React from 'react'
// If you have shadcn/ui primitives, import them:
// import { Card, CardHeader, CardContent } from '@/components/ui/card'
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
// import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, UserRoundPlus } from 'lucide-react'
import { Separator } from './ui/separator'

interface StudentCardProps {
  displayName: string
  email: string
  photoUrl?: string
  about?: string
  expertSubject?: string
  preparingSince?: string
  targetYear?: string
}

const StudentCard: React.FC<StudentCardProps> = ({
  displayName,
  email,
  photoUrl,
  about,
  expertSubject,
  preparingSince,
  targetYear,
}) => {
  return (
    <div
      className="bg-card border rounded-xl shadow-sm hover:shadow-lg transition-shadow flex flex-col md:flex-col items-center w-full max-w-xs mx-auto p-0 overflow-hidden md:min-h-[340px] min-h-[140px] relative"
    >
      {/* Send Request button - top right on mobile, hidden on md+ (portrait) */}
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 right-2 z-10 flex items-center gap-1 md:hidden"
        title="Send Request"
      >
        <UserRoundPlus className="w-4 h-4" />
      </Button>
      {/* Landscape layout for mobile, portrait for md+ */}
      <div className="flex flex-row md:flex-col items-center w-full h-full">
        {/* Profile photo */}
        <div className="flex-shrink-0 flex items-center justify-center p-4 md:pt-6 md:pb-2">
          {photoUrl ? (
            <img src={photoUrl} alt={displayName} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-background shadow" />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center text-2xl text-muted-foreground border">
              <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          )}
        </div>
        {/* Details */}
        <div className="flex-1 flex flex-col justify-center items-start md:items-center px-2 md:px-6 py-2 md:py-0 w-full ">
          <div className="font-semibold text-lg md:text-xl text-left md:text-center truncate w-full">{displayName}</div>
          {about && (
            <div className="mt-2 text-sm text-muted-foreground text-left md:text-center line-clamp-4  w-full">
              {about}
            </div>
          )}
          <Separator className='my-2'/>
          <div className="flex flex-col gap-1 text-sm mt-2 justify-center w-full">
            {expertSubject && <div className="px-2 py-1 rounded-full">Fav Subject : {expertSubject}</div>}
            {targetYear && <div className="px-2 py-1 rounded-full">Target: {targetYear}</div>}
            {preparingSince && <div className="px-2 py-1 rounded-full">Since: {preparingSince}</div>}
          </div>
          {/* <Separator className='my-2'/> */}
          <Button className='mb-2'>Connect +</Button>
        </div>
      </div>
      {/* Portrait Send Request button for md+ (optional, can be hidden or shown as needed) */}
        {/* <UserRoundPlus className="w-4 h-4 absolute top-4 right-4" /> */}
      </div>
  )
}

export default StudentCard 