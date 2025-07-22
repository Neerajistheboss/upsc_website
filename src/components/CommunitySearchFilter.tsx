import React from 'react'
import { Search, Filter, AtSignIcon } from 'lucide-react'

interface CommunitySearchFilterProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  handleSearch: (e: React.FormEvent) => void
  subjectOptions: string[]
  selectedSubject: string
  handleSubjectFilter: (subject: string) => void
  clearFilters: () => void
}

const CommunitySearchFilter: React.FC<CommunitySearchFilterProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  subjectOptions,
  selectedSubject,
  handleSubjectFilter,
  clearFilters
}) => (
  <div className="mb-8 space-y-6 ">
    {/* Search Bar */}
    <form onSubmit={handleSearch} className="relative">
    <div className="relative w-full">
  {/* <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" /> */}
  <input
    type="text"
    placeholder="Search by name, subject, or description..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-12 pr-4 py-3 border border-border/50 rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
  />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <Search size={16} aria-hidden="true" />
        </div>
</div>



      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        Search
      </button>
    </form>
    {/* Subject Filter */}
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filter by subject:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleSubjectFilter('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedSubject === '' 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All Subjects
        </button>
        {subjectOptions.map((subject) => (
          <button
            key={subject}
            onClick={() => handleSubjectFilter(subject)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedSubject === subject 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
    {/* Clear Filters */}
    {(searchQuery || selectedSubject) && (
      <button
        onClick={clearFilters}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Clear all filters
      </button>
    )}
  </div>
)

export default CommunitySearchFilter 