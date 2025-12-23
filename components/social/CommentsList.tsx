'use client'

import { useState } from 'react'
import { useComments, useRealtimeComments, useCreateComment, useDeleteComment } from '@/lib/hooks/useComments'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

interface CommentsListProps {
    postId: string
}

export function CommentsList({ postId }: CommentsListProps) {
    const { user } = useAuth()
    const { data: comments, isLoading } = useComments(postId)
    const [newComment, setNewComment] = useState('')
    const createComment = useCreateComment()
    const deleteComment = useDeleteComment()

    // Subscribe to real-time updates
    useRealtimeComments(postId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            await createComment.mutateAsync({
                post_id: postId,
                body: newComment.trim(),
            })
            setNewComment('')
        } catch (error: any) {
            alert(error.message || 'Failed to post comment')
        }
    }

    const handleDelete = async (commentId: string) => {
        if (confirm('Delete this comment?')) {
            await deleteComment.mutateAsync(commentId)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-background" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-background rounded w-1/4" />
                            <div className="h-3 bg-background rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Comment Composer */}
            {user && (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-background flex-shrink-0">
                        {user.user_metadata?.avatar_url ? (
                            <Image
                                src={user.user_metadata.avatar_url}
                                alt="Your avatar"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={2}
                            maxLength={1500}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Write a comment..."
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted">{newComment.length}/1500</span>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || createComment.isPending}
                                className="px-4 py-2 bg-primary text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {createComment.isPending ? 'Posting...' : 'Comment'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Link href={`/app/profile/${comment.author_id}`} className="flex-shrink-0">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-background">
                                    {comment.author_avatar ? (
                                        <Image
                                            src={comment.author_avatar}
                                            alt={comment.author_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </Link>

                            <div className="flex-1 min-w-0">
                                <div className="bg-background rounded-lg p-3">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <Link
                                            href={`/app/profile/${comment.author_id}`}
                                            className="font-semibold text-foreground hover:underline"
                                        >
                                            {comment.author_name}
                                        </Link>
                                        {user?.id === comment.author_id && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-muted hover:text-danger transition-colors"
                                                title="Delete comment"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-foreground whitespace-pre-wrap break-words">
                                        {comment.body}
                                    </p>
                                </div>
                                <p className="text-xs text-muted mt-1 px-3">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted py-8">
                        No comments yet. Be the first to comment!
                    </p>
                )}
            </div>
        </div>
    )
}
