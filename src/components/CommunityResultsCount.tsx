import React from 'react'

interface CommunityResultsCountProps {
  usersLength: number
  searchQuery: string
  selectedSubject: string
}

const CommunityResultsCount: React.FC<CommunityResultsCountProps> = ({ usersLength, searchQuery, selectedSubject }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {usersLength} public profile{usersLength !== 1 ? 's' : ''} found
      </p>
    </div>
    <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <p className="text-sm text-primary">
        👋 <strong>Join the community!</strong> Sign up to connect with fellow UPSC aspirants.
      </p>
    </div>
  </div>
)

export default CommunityResultsCount 