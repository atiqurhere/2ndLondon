'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [copied, setCopied] = useState(false)
    const router = useRouter()
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

    const handleComment = () => {
        router.push(`/app/post/${post.id}#comments`)
    }

    const handleShare = async () => {
        const url = `${window.location.origin}/app/post/${post.id}`

        // Try native share first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Post by ${post.author_name}`,
                    text: post.content.slice(0, 100),
                    url: url,
                })
                return
            } catch (err) {
                // User cancelled or share failed, show menu
            }
        }

        // Fallback to copy link
        setShowShareMenu(!showShareMenu)
    }

    const copyLink = async () => {
        const url = `${window.location.origin}/app/post/${post.id}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
            setShowShareMenu(false)
        }, 2000)
    }

    const currentReaction = reactions.find((r) => r.type === post.user_reaction)

    return (
        <div>
            {/* Counts Row */}
            <div className="flex items-center justify-between mb-3 text-sm text-muted">
                {/* Reaction Counts */}
                {post.total_reactions > 0 && (
                    <button
                        className="flex items-center gap-2 hover:underline cursor-pointer"
                        onClick={() => router.push(`/app/post/${post.id}`)}
                    >
                        <div className="flex -space-x-1">
                            {post.like_count > 0 && <span className="text-base">👍</span>}
                            {post.celebrate_count > 0 && <span className="text-base">🎉</span>}
                            {post.support_count > 0 && <span className="text-base">💪</span>}
                            {post.love_count > 0 && <span className="text-base">❤️</span>}
                            {post.insightful_count > 0 && <span className="text-base">💡</span>}
                        </div>
                        <span>{post.total_reactions} {post.total_reactions === 1 ? 'reaction' : 'reactions'}</span>
                    </button>
                )}

                {/* Comment and Save Counts */}
                <div className="flex items-center gap-4">
                    {post.comment_count > 0 && (
                        <button
                            onClick={handleComment}
                            className="hover:underline cursor-pointer"
                        >
                            {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
                        </button>
                    )}

                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
                {/* Reaction Button */}
                <div className="relative flex-1">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${currentReaction
                            ? 'bg-primary bg-opacity-10 text-primary'
                            : 'hover:bg-background text-muted hover:text-primary'
                            }`}
                    >
                        <span className="text-lg">{currentReaction?.icon || '👍'}</span>
                        <span className="text-sm font-medium">
                            {currentReaction?.label || 'Like'}
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
                <button
                    onClick={handleComment}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-background text-muted hover:text-primary transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">Comment</span>
                </button>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${post.is_saved
                        ? 'text-primary bg-primary bg-opacity-10'
                        : 'text-muted hover:text-primary hover:bg-background'
                        }`}
                    title={post.is_saved ? 'Unsave' : 'Save'}
                >
                    <svg className="w-5 h-5" fill={post.is_saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="text-sm font-medium">Save</span>
                </button>

                {/* Share Button */}
                <div className="relative flex-1">
                    <button
                        onClick={handleShare}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-background text-muted hover:text-primary transition-colors"
                        title="Share"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="text-sm font-medium">Share</span>
                    </button>

                    {/* Share Menu */}
                    {showShareMenu && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-surface border border-border rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                            <button
                                onClick={copyLink}
                                className="w-full px-4 py-2 text-left hover:bg-background transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>{copied ? 'Copied!' : 'Copy link'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
