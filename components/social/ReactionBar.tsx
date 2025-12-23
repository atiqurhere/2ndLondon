'use client'

import { useState } from 'react'
import type { Post, ReactionType } from '@/types/social'
import { useToggleReaction } from '@/lib/hooks/useReactions'
import { useSavePost, useUnsavePost } from '@/lib/hooks/usePosts'

interface ReactionBarProps {
    post: Post
}

const reactions: { type: ReactionType; icon: string; label: string }[] = [
    { type: 'like', icon: '👍', label: 'Like' },
    { type: 'celebrate', icon: '🎉', label: 'Celebrate' },
    { type: 'support', icon: '💪', label: 'Support' },
    { type: 'love', icon: '❤️', label: 'Love' },
    { type: 'insightful', icon: '💡', label: 'Insightful' },
]

export function ReactionBar({ post }: ReactionBarProps) {
    const [showPicker, setShowPicker] = useState(false)
    const toggleReaction = useToggleReaction()
    const savePost = useSavePost()
    const unsavePost = useUnsavePost()

    const handleReaction = async (reactionType: ReactionType) => {
        setShowPicker(false)
        await toggleReaction.mutateAsync({
            postId: post.id,
            currentReaction: post.user_reaction,
            newReaction: reactionType,
        })
    }

    const handleSave = async () => {
        if (post.is_saved) {
            await unsavePost.mutateAsync(post.id)
        } else {
            await savePost.mutateAsync(post.id)
        }
    }

    const currentReaction = reactions.find((r) => r.type === post.user_reaction)

    return (
        <div className="flex items-center justify-between">
            {/* Reaction Counts */}
            <div className="flex items-center gap-4 text-sm text-muted">
                {post.total_reactions > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                            {post.like_count > 0 && <span className="text-base">👍</span>}
                            {post.celebrate_count > 0 && <span className="text-base">🎉</span>}
                            {post.support_count > 0 && <span className="text-base">💪</span>}
                            {post.love_count > 0 && <span className="text-base">❤️</span>}
                            {post.insightful_count > 0 && <span className="text-base">💡</span>}
                        </div>
                        <span>{post.total_reactions}</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                {/* Reaction Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentReaction
                                ? 'bg-primary bg-opacity-10 text-primary'
                                : 'hover:bg-background text-muted hover:text-primary'
                            }`}
                    >
                        <span className="text-lg">{currentReaction?.icon || '👍'}</span>
                        <span className="text-sm font-medium">
                            {currentReaction?.label || 'React'}
                        </span>
                    </button>

                    {/* Reaction Picker */}
                    {showPicker && (
                        <div className="absolute bottom-full left-0 mb-2 bg-surface border border-border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                            {reactions.map((reaction) => (
                                <button
                                    key={reaction.type}
                                    onClick={() => handleReaction(reaction.type)}
                                    className="p-2 hover:bg-background rounded-lg transition-all hover:scale-110"
                                    title={reaction.label}
                                >
                                    <span className="text-2xl">{reaction.icon}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comment Button */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-background text-muted hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">Comment</span>
                </button>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className={`p-2 rounded-lg transition-colors ${post.is_saved
                            ? 'text-primary'
                            : 'text-muted hover:text-primary hover:bg-background'
                        }`}
                    title={post.is_saved ? 'Unsave' : 'Save'}
                >
                    <svg className="w-5 h-5" fill={post.is_saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>

                {/* Share Button */}
                <button className="p-2 rounded-lg hover:bg-background text-muted hover:text-primary transition-colors" title="Share">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
