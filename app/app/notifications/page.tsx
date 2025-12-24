'use client'

import { useNotifications, useMarkNotificationRead } from '@/lib/hooks/useNotifications'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
    const { data: notifications, isLoading } = useNotifications()
    const markAsRead = useMarkNotificationRead()
    const router = useRouter()

    const handleNotificationClick = (notification: any) => {
        // Mark as read
        if (!notification.read) {
            markAsRead.mutate(notification.id)
        }

        // Navigate to link
        if (notification.link) {
            router.push(notification.link)
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Notifications</h1>

            {!notifications || notifications.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                    <div className="text-6xl mb-4">🔔</div>
                    <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
                    <p className="text-muted">When you get notifications, they'll show up here</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification: any) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent ${notification.read
                                    ? 'bg-card border-border'
                                    : 'bg-primary/5 border-primary/20'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Actor Avatar */}
                                {notification.actor && (
                                    <img
                                        src={notification.actor.avatar_url || '/default-avatar.png'}
                                        alt={notification.actor.display_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">
                                                {notification.title}
                                            </h3>
                                            {notification.body && (
                                                <p className="text-sm text-muted mt-1">
                                                    {notification.body}
                                                </p>
                                            )}
                                        </div>

                                        {/* Unread indicator */}
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <p className="text-xs text-muted mt-2">
                                        {formatDistanceToNow(new Date(notification.created_at), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
