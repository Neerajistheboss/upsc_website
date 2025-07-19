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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

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
            <div className="flex items-center space-x-2">
              <div className="h-8 rounded-lg bg-primary text-white  flex items-center justify-center px-2">
              UPSC
           
              </div>
            </div>
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
            <button className="text-sm font-medium transition-colors hover:text-primary">
              Login
            </button>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 