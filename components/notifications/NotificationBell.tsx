'use client'

import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead } from '@/lib/hooks/useNotifications'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { data: notifications } = useNotifications()
    const { data: unreadCount } = useUnreadNotificationCount()
    const markAsRead = useMarkNotificationRead()

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            markAsRead.mutate(notification.id)
        }
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-muted hover:text-foreground transition-colors"
                aria-label="Notifications"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Unread Badge */}
                {unreadCount && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border">
                        <h3 className="font-semibold">Notifications</h3>
                    </div>

                    {/* Notifications List */}
                    {notifications && notifications.length > 0 ? (
                        <div>
                            {notifications.map((notification: any) => (
                                <Link
                                    key={notification.id}
                                    href={notification.link || '/app/feed'}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`block px-4 py-3 border-b border-border hover:bg-surface-hover transition-colors ${!notification.read ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Actor Avatar */}
                                        {notification.actor && (
                                            <img
                                                src={notification.actor.avatar_url || '/default-avatar.png'}
                                                alt={notification.actor.display_name}
                                                className="w-10 h-10 rounded-full"
                                            />
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{notification.title}</p>
                                            {notification.body && (
                                                <p className="text-sm text-muted mt-1">{notification.body}</p>
                                            )}
                                            <p className="text-xs text-muted mt-1">
                                                {formatDistanceToNow(new Date(notification.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>

                                        {/* Unread Indicator */}
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center text-muted">
                            <p>No notifications yet</p>
                        </div>
                    )}

                    {/* Footer */}
                    {notifications && notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-border">
                            <Link
                                href="/app/notifications"
                                className="text-sm text-primary hover:underline"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
