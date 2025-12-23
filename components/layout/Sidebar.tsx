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

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border h-screen sticky top-0">
            <div className="p-6">
                <Link href="/app/feed" className="text-2xl font-bold">
                    Second London
                </Link>
            </div>

            <nav className="flex-1 px-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors',
                                isActive
                                    ? 'bg-background text-primary'
                                    : 'text-muted hover:bg-background hover:text-primary'
                            )}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <Link
                    href="/app/moments/new"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                    <span>➕</span>
                    <span>Create Moment</span>
                </Link>
            </div>
        </aside>
    )
}
