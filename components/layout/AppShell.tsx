'use client'

import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'

export function AppShell({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="md:ml-64 min-h-screen">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 bg-surface border-b border-border">
                    <div className="flex items-center justify-between px-4 h-16">
                        <Link href="/app/feed" className="text-xl font-bold md:hidden">
                            Second London
                        </Link>

                        <div className="flex items-center gap-4 ml-auto">
                            {/* Notifications could go here */}
                            <Link href="/app/profile" className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                                <span className="text-xl">👤</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="pb-20 md:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <BottomNav />
        </div>
    )
}
