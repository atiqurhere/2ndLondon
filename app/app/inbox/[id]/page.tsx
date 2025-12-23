'use client'

import { use, useState, useEffect, useRef } from 'react'
import { useConversation, useMessages, useSendMessage } from '@/lib/hooks/useMessages'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatMessageTime } from '@/lib/utils/time'

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user } = useAuth()
    const { data: conversation } = useConversation(id)
    const { data: messages } = useMessages(id)
    const sendMessage = useSendMessage()

    const [messageBody, setMessageBody] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (!conversation) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const otherUser = conversation.creator_id === user?.id ? conversation.other : conversation.creator

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!messageBody.trim()) return

        try {
            await sendMessage.mutateAsync({
                conversationId: id,
                body: messageBody,
            })
            setMessageBody('')
        } catch (error: any) {
            alert(error.message)
        }
    }

    return (
        <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="bg-surface border-b border-border p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                        <span>👤</span>
                    </div>
                    <div>
                        <div className="font-semibold">{otherUser.display_name}</div>
                        <div className="text-xs text-muted">Re: {conversation.moment.title}</div>
                    </div>
                </div>
            </div>

            {/* Safety Banner */}
            <div className="bg-warning bg-opacity-10 border-b border-warning px-4 py-3">
                <div className="text-sm text-warning">
                    🛡️ <strong>Stay Safe:</strong> Meet in public places. Never share personal financial information.
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((message: any) => {
                    const isOwn = message.sender_id === user?.id

                    return (
                        <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] ${isOwn
                                    ? 'bg-primary text-background'
                                    : 'bg-surface text-primary'
                                    } px-4 py-3 rounded-lg`}
                            >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                    {message.body}
                                </p>
                                <div
                                    className={`text-xs mt-1 ${isOwn ? 'text-background opacity-70' : 'text-muted'
                                        }`}
                                >
                                    {formatMessageTime(message.created_at)}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="bg-surface border-t border-border p-4">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        maxLength={2000}
                        className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Type a message..."
                    />
                    <button
                        type="submit"
                        disabled={!messageBody.trim() || sendMessage.isPending}
                        className="px-6 py-3 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    )
}
