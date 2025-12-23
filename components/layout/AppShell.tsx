'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import Link from 'next/link'
import { useState } from 'react'

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar - Fixed */}
            <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />

            {/* Main Content - Responsive to sidebar state */}
            <div
                className="flex flex-col min-h-screen transition-all duration-300"
                style={{ marginLeft: isSidebarExpanded ? '256px' : '80px' }}
            >
                {/* Top Bar */}
                <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-3 md:hidden">
                        <div className="text-2xl">🌆</div>
                        <h1 className="text-xl font-bold">Second London</h1>
                    </div>

                    <div className="ml-auto">
                        <Link
                            href="/app/profile"
                            className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center font-bold hover:opacity-90 transition-opacity"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>
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
