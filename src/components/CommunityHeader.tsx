import React from 'react'
import { Users } from 'lucide-react'

const CommunityHeader: React.FC = () => (
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-2">
      <Users className="w-6 h-6 text-primary" />
      <h1 className="text-3xl font-bold">UPSC Community</h1>
    </div>
    <p className="text-muted-foreground">
      Connect with fellow UPSC aspirants and find study partners
    </p>
  </div>
)

export default CommunityHeader 