import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'

const PROFILE_BUCKET = 'profile-photos'

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({
    email: '',
    phone: '',
    displayName: '',
    about: '',
    expertSubject: '',
    targetYear: '',
    preparingSince: '',
    photoUrl: '',
    publicAccount: false
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dropdown options
  const subjectOptions = [
    '', 'General Studies', 'History', 'Geography', 'Polity', 'Economics', 'Environment', 'Science & Tech', 'Ethics', 'Essay', 'Optional Subject', 'CSAT'
  ]
  const targetYearOptions = Array.from({ length: 7 }, (_, i) => (2024 + i).toString())
  const preparingSinceOptions = Array.from({ length: 10 }, (_, i) => (2015 + i).toString())

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        navigate('/login')
        return
      }
      setUser(data.user)
      setForm({
        email: data.user.email || '',
        phone: data.user.user_metadata?.phone || '',
        displayName: data.user.user_metadata?.displayName || '',
        about: data.user.user_metadata?.about || '',
        expertSubject: data.user.user_metadata?.expertSubject || '',
        targetYear: data.user.user_metadata?.targetYear || '',
        preparingSince: data.user.user_metadata?.preparingSince || '',
        photoUrl: data.user.user_metadata?.photoUrl || '',
        publicAccount: !!data.user.user_metadata?.publicAccount
      })
      setPhotoPreview(data.user.user_metadata?.photoUrl || '')
    })
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handlePhotoUpload = async () => {
    if (!photoFile || !user) return null
    setUploading(true)
    const fileExt = photoFile.name.split('.').pop()
    const filePath = `${user.id}.${fileExt}`
    const { error } = await supabase.storage.from(PROFILE_BUCKET).upload(filePath, photoFile, { upsert: true })
    if (error) {
      toast.error('Photo upload failed')
      setUploading(false)
      return null
    }
    const { data } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(filePath)
    setUploading(false)
    return data.publicUrl
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let photoUrl = form.photoUrl
    if (photoFile) {
      const uploadedUrl = await handlePhotoUpload()
      if (uploadedUrl) photoUrl = uploadedUrl
    }
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          phone: form.phone,
          displayName: form.displayName,
          about: form.about,
          expertSubject: form.expertSubject,
          targetYear: form.targetYear,
          preparingSince: form.preparingSince,
          photoUrl,
          publicAccount: form.publicAccount
        }
      })
      if (error) throw error
      toast.success('Profile updated!')
      setPhotoFile(null)
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border rounded-lg shadow-lg p-6 w-full max-w-md md:max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
        <form onSubmit={handleUpdate} className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
          {/* Left column: photo, email, phone, display name */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-24">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-24 h-24 rounded-full object-cover border" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-4xl text-muted-foreground border">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                )}
                <button type="button" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 border border-white shadow" onClick={() => fileInputRef.current?.click()} title="Change photo">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6 6M9 13l-6 6m6-6l6-6" /></svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              {uploading && <div className="text-xs text-muted-foreground mt-1">Uploading...</div>}
              <div className="flex items-center gap-2 mt-3">
                <label htmlFor="publicAccount" className="text-sm select-none cursor-pointer">Public Account</label>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.publicAccount ? 'bg-primary' : 'bg-muted'}`}
                  onClick={() => setForm((prev) => ({ ...prev, publicAccount: !prev.publicAccount }))}
                  id="publicAccount"
                  aria-pressed={form.publicAccount}
                >
                  <span className="sr-only">Toggle public account</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.publicAccount ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input name="email" type="email" value={form.email} disabled className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm mb-1">Display Name</label>
              <input name="displayName" type="text" value={form.displayName} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
            </div>
          </div>
          {/* Right column: about, expert subject, target year, preparing since */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1">About Me</label>
              <textarea name="about" value={form.about} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm mb-1">Expert Subject</label>
              <select name="expertSubject" value={form.expertSubject} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
                {subjectOptions.map((subj) => (
                  <option key={subj} value={subj}>{subj || 'Select subject'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Target Year</label>
              <select name="targetYear" value={form.targetYear} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
                <option value="">Select year</option>
                {targetYearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Preparing Since (Year)</label>
              <select name="preparingSince" value={form.preparingSince} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
                <option value="">Select year</option>
                {preparingSinceOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-end">
              <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors" disabled={loading}>
                {loading ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage 