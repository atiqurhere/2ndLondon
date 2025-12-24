'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()
    const supabase = createClient()
    const router = useRouter()

    // Fetch user profile
    useEffect(() => {
        if (user) {
            supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
                .then(({ data }) => setProfile(data))
        }
    }, [user, supabase])

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar - Fixed */}
            <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />

            {/* Main Content - Responsive to sidebar state */}
            <div
                className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'
                    }`}
            >
                {/* Top Bar */}
                <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-3 md:hidden">
                        <div className="text-2xl">🌆</div>
                        <h1 className="text-xl font-bold">Second London</h1>
                    </div>

                    {/* Notifications and Profile */}
                    <div className="ml-auto flex items-center gap-3">
                        <NotificationBell />

                        {/* Profile Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center font-bold hover:opacity-90 transition-opacity overflow-hidden"
                            >
                                {profile?.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.display_name || 'Profile'}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg py-2 z-50">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-border">
                                        <p className="font-semibold">{profile?.display_name || 'User'}</p>
                                        <p className="text-sm text-muted">{user?.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <Link
                                        href="/app/profile"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>See Profile</span>
                                    </Link>

                                    <Link
                                        href="/app/saved"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        <span>Saved Posts</span>
                                    </Link>

                                    <Link
                                        href="/app/safety"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Help & Support</span>
                                    </Link>

                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors w-full text-left text-danger"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content - Scrollable independently */}
                <main className="flex-1 overflow-y-auto">
                    <div className="pb-20 md:pb-0">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Nav */}
                <div className="md:hidden">
                    <BottomNav />
                </div>
            </div>
        </div>
    )
}
