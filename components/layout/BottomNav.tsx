'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/helpers'

const navItems = [
    { href: '/app/social', label: 'Social', icon: '📱' },
    { href: '/app/feed', label: 'Moments', icon: '📍' },
    { href: '/app/moments/new', label: 'Create', icon: '➕' },
    { href: '/app/inbox', label: 'Inbox', icon: '💬' },
    { href: '/app/profile', label: 'Profile', icon: '👤' },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                                isActive ? 'text-primary' : 'text-muted hover:text-primary'
                            )}
                        >
                            <span className="text-xl mb-1">{item.icon}</span>
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
