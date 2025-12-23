'use client'

import { useConversations } from '@/lib/hooks/useMessages'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatMessageTime } from '@/lib/utils/time'
import Link from 'next/link'

export default function InboxPage() {
    const { user } = useAuth()
    const { data: conversations, isLoading } = useConversations()

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Inbox</h1>
                <p className="text-muted text-sm">Your conversations</p>
            </div>

            {conversations && conversations.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted text-lg mb-2">No conversations yet</p>
                    <p className="text-muted text-sm">
                        Apply to moments to start chatting
                    </p>
                </div>
            )}

            <div className="space-y-2">
                {conversations?.map((conv: any) => {
                    const otherUser = conv.creator_id === user?.id ? conv.other : conv.creator
                    const lastMessage = conv.messages?.[conv.messages.length - 1]

                    return (
                        <Link
                            key={conv.id}
                            href={`/app/inbox/${conv.id}`}
                            className="block bg-surface p-4 rounded-card border border-border hover:bg-opacity-80 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">👤</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-semibold truncate">
                                            {otherUser.display_name}
                                        </div>
                                        {lastMessage && (
                                            <div className="text-xs text-muted">
                                                {formatMessageTime(lastMessage.created_at)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-sm text-muted mb-1 truncate">
                                        Re: {conv.moment.title}
                                    </div>

                                    {lastMessage && (
                                        <div className="text-sm text-muted truncate">
                                            {lastMessage.body}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
