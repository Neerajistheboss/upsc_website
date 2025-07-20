import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import GoogleLoginButton from './GoogleLoginButton'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  ) },
  { value: 'dark', label: 'Dark', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
  ) },
  { value: 'blue', label: 'Blue', icon: (
    <span className="inline-block w-5 h-5 rounded-full bg-blue-200 border border-blue-400" />
  ) },
  { value: 'green', label: 'Green', icon: (
    <span className="inline-block w-5 h-5 rounded-full bg-green-200 border border-green-400" />
  ) },
  { value: 'pink', label: 'Pink', icon: (
    <span className="inline-block w-5 h-5 rounded-full bg-pink-200 border border-pink-400" />
  ) },
  { value: 'lavender', label: 'Lavender', icon: (
    <span className="inline-block w-5 h-5 rounded-full bg-purple-200 border border-purple-400" />
  ) },
  { value: 'mint', label: 'Mint', icon: (
    <span className="inline-block w-5 h-5 rounded-full bg-teal-100 border border-teal-300" />
  ) },
  { value: 'peach', label: 'Peach', icon: (
    <span className="inline-block w-5 h-5 rounded-full bg-orange-100 border border-orange-300" />
  ) },
  { value: 'sky', label: 'Sky', icon: (
    <span className="inline-block w-5 h-5 rounded-full bg-sky-100 border border-sky-300" />
  ) },
  { value: 'lemon', label: 'Lemon', icon: (
    <span className="inline-block w-5 h-5 rounded-full bg-yellow-100 border border-yellow-300" />
  ) },
]

const ThemeDropdown = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  // Determine current theme (custom or next-themes)
  let current = THEME_OPTIONS.find(opt => opt.value === theme) || THEME_OPTIONS[0]
  if ((theme === 'system' || theme === 'light' || theme === 'dark') && !['blue','green','pink'].includes(theme)) {
    current = THEME_OPTIONS.find(opt => opt.value === resolvedTheme) || THEME_OPTIONS[0]
  }

  // Set html class for custom themes
  React.useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.remove('theme-blue', 'theme-green', 'theme-pink', 'theme-lavender', 'theme-mint', 'theme-peach', 'theme-sky', 'theme-lemon')
    body.classList.remove('theme-blue', 'theme-green', 'theme-pink', 'theme-lavender', 'theme-mint', 'theme-peach', 'theme-sky', 'theme-lemon')
    if (typeof theme === 'string' && [
      'blue', 'green', 'pink', 'lavender', 'mint', 'peach', 'sky', 'lemon'
    ].includes(theme)) {
      html.classList.add(`theme-${theme}`)
      body.classList.add(`theme-${theme}`)
    }
  }, [theme])

  const handleSelect = (value: string) => {
    setOpen(false)
    if (value === 'light' || value === 'dark') {
      setTheme(value)
    } else {
      setTheme(value)
    }
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 p-2 rounded-full hover:bg-accent transition-colors"
        onClick={() => setOpen(v => !v)}
        title="Change theme"
      >
        {current.icon}
        <span className="hidden md:inline text-sm">{current.label}</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-background border rounded shadow-lg z-50">
          {THEME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-accent ${current.value === opt.value ? 'font-bold' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const AuthModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Logged in successfully!')
        onClose()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Signup successful! Please check your email to verify.')
        setMode('login')
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = () => {
    onClose()
  }

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-center">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        
        {/* Google Login Button */}
        <GoogleLoginButton 
          variant={mode === 'signup' ? 'register' : 'login'} 
          onSuccess={handleGoogleSuccess}
          className="mb-4"
        />
        
        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button className="text-primary underline" onClick={() => setMode('signup')}>Sign Up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="text-primary underline" onClick={() => setMode('login')}>Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  ) : null
}

function getInitials(nameOrEmail: string) {
  if (!nameOrEmail) return ''
  const parts = nameOrEmail.split(' ')
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (nameOrEmail.includes('@')) return nameOrEmail[0].toUpperCase()
  return nameOrEmail.slice(0, 2).toUpperCase()
}

const UserMenu = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const displayName = user.user_metadata?.displayName || user.email
  const initials = getInitials(displayName)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full  text-primary font-bold text-lg border border-input hover:bg-primary/10 transition-colors"
          title={displayName}
        >
          {initials || (
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <div className="px-4 py-2 text-sm text-muted-foreground border-b">{displayName}</div>
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { user, signOut } = useAuth()

  const navigationItems = [
    // { href: "/", label: "Home" },
    // { href: "#syllabus", label: "Syllabus" },
    // { href: "#practice", label: "Practice" },
    // { href: "#resources", label: "Resources" },
    // { href: "#about", label: "About" },
    { href: "/pyq", label: "Previous Year Question Papers" },
    { href: "/current-affairs", label: "Current Affairs" },
    { href: "/species-in-news", label: "Species in News" },
    { href: "/bookmarks", label: "My Bookmarks", icon: "bookmark" },
  ]

  const externalLinks = [
    { 
      href: "https://upsc.gov.in/sites/default/files/Revised-II-AnnualCalendar-2025-Engl-071124_0.pdf", 
      label: "UPSC Calendar 2025",
      isExternal: true
    },
  ]

  const adminLinks = [
    {
      href: "/admin/pdf-urls",
      label: "Manage PDF URLs",
      isInternal: true
    },
    {
      href: "/admin/current-affairs",
      label: "Manage Current Affairs",
      isInternal: true
    },
    {
      href: "/admin/species",
      label: "Manage Species",
      isInternal: true
    }
  ]



  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <button className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>UPSC</DrawerTitle>
                    <DrawerDescription>
                      Navigate through the application
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-0">
                    <div className="space-y-4">
                      {navigationItems.map((item) => (
                        <DrawerClose asChild key={item.href}>
                          <Link
                            to={item.href}
                            className="block text-lg font-medium transition-colors hover:text-primary py-2 flex items-center"
                          >
                            {item.icon === 'bookmark' && (
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            )}
                            {item.label}
                          </Link>
                        </DrawerClose>
                      ))}
                      <div className="pt-4 border-t">
                        <ThemeDropdown />
                        {user ? (
                          <>
                            <UserMenu user={user} onLogout={signOut} />
                          </>
                        ) : (
                          <>
                            <Link to="/login" className="w-full block text-left text-sm font-medium transition-colors hover:text-primary py-2">
                              Login
                            </Link>
                            <Link to="/register" className="w-full block text-left text-sm font-medium transition-colors hover:text-primary py-2">
                              Sign Up
                            </Link>
                          </>
                        )}
                      </div>
                      
                      {/* External Links Section */}
                      <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">External Resources</h3>
                        {externalLinks.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-lg font-medium transition-colors hover:text-primary py-2 flex items-center"
                          >
                            {item.label}
                            <svg
                              className="ml-2 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        ))}
                      </div>

                      {/* Admin Links Section */}
                      {/* <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Admin</h3>
                        {adminLinks.map((item) => (
                          <DrawerClose asChild key={item.href}>
                            <Link
                              to={item.href}
                              className="block text-lg font-medium transition-colors hover:text-primary py-2 flex items-center"
                            >
                              {item.label}
                            </Link>
                          </DrawerClose>
                        ))}
                      </div> */}
                    </div>
                  </div>
                  <DrawerFooter>
                    {/* <div className="flex flex-col space-y-2">
                      <button className="w-full text-left text-sm font-medium transition-colors hover:text-primary py-2">
                        Login
                      </button>
                      <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Sign Up
                      </button>
                    </div> */}
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>

            {/* Logo/Brand */}
            <Link to="/">
            <div className="flex items-center space-x-2">
              <div className="h-8 rounded-lg bg-primary text-white  flex items-center justify-center px-2">
              UPSC
           
              </div>
            </div>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.href}
                to={item.href} 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side - Login/Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeDropdown />
            {user ? (
              <>
                <UserMenu user={user} onLogout={signOut} />
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">
                  Login
                </Link>
                <Link to="/register" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 