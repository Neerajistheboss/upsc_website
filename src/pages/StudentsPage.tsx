import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import StudentCard from '@/components/StudentCard'

interface Student {
  raw_user_meta_data: any
  id: string
  email: string
  user_metadata: {
    displayName?: string
    photoUrl?: string
    about?: string
    expertSubject?: string
    targetYear?: string
    preparingSince?: string
    publicAccount?: boolean
  }
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      setError(null)
      // Fetch users with publicAccount: true from auth.users (if RLS allows)
      const { data, error } = await supabase.rpc('get_public_users')
      if (error) {
        setError('Failed to load students')
        setLoading(false)
        return
      }
      setStudents(data || [])
      setLoading(false)
    }
    fetchStudents()
  }, [])

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Other Students</h1>
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : students.length === 0 ? (
          <div className="text-center text-muted-foreground">No public student profiles found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.map((student) => {
              const meta = (student as any).raw_user_meta_data || (student as any).user_metadata || {};
              return (
                <StudentCard
                  key={student.id}
                  displayName={meta.displayName || student.email}
                  email={student.email}
                  photoUrl={meta.photoUrl}
                  about={meta.about}
                  expertSubject={meta.expertSubject}
                  preparingSince={meta.preparingSince}
                  targetYear={meta.targetYear}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentsPage 
