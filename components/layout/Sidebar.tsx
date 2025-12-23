'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/helpers'

const navItems = [
    { href: '/app/feed', label: 'Nearby', icon: '📍' },
    { href: '/app/ending-soon', label: 'Ending Soon', icon: '⏰' },
    { href: '/app/verified', label: 'Verified', icon: '✓' },
    { href: '/app/free', label: 'Free', icon: '🎁' },
    { href: '/app/swaps', label: 'Swaps', icon: '🔄' },
    { href: '/app/inbox', label: 'Inbox', icon: '💬' },
    { href: '/app/profile', label: 'Profile', icon: '👤' },
    { href: '/app/safety', label: 'Safety', icon: '🛡️' },
]

interface SidebarProps {
    isExpanded: boolean
    setIsExpanded: (expanded: boolean) => void
}

export function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside
            className={cn(
                'hidden md:flex flex-col bg-surface border-r border-border h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-50',
                isExpanded ? 'w-64' : 'w-20'
            )}
        >
            {/* Header with Logo and Toggle */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                {isExpanded ? (
                    <Link href="/app/feed" className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">🌆</span>
                        <span className="whitespace-nowrap">Second London</span>
                    </Link>
                ) : (
                    <Link href="/app/feed" className="text-2xl mx-auto">
                        🌆
                    </Link>
                )}

                {isExpanded && (
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                        aria-label="Collapse sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all duration-200',
                                isActive
                                    ? 'bg-primary text-background shadow-lg scale-105'
                                    : 'text-muted hover:bg-background hover:text-primary hover:scale-102',
                                !isExpanded && 'justify-center'
                            )}
                            title={!isExpanded ? item.label : undefined}
                        >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            {isExpanded && (
                                <span className="font-medium whitespace-nowrap">{item.label}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Collapse Button (when collapsed) */}
            {!isExpanded && (
                <div className="p-3 border-t border-border">
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="w-full p-3 hover:bg-background rounded-lg transition-colors flex items-center justify-center"
                        aria-label="Expand sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Create Moment Button */}
            <div className="p-4 border-t border-border">
                <Link
                    href="/app/moments/new"
                    className={cn(
                        'flex items-center gap-2 w-full px-4 py-3 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg',
                        !isExpanded && 'justify-center px-3'
                    )}
                >
                    <span className="text-xl">➕</span>
                    {isExpanded && <span>Create Moment</span>}
                </Link>
            </div>
        </aside>
    )
}
