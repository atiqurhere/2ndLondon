'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import type { Post } from '@/types/social'
import { ReactionBar } from '@/components/social/ReactionBar'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDeletePost } from '@/lib/hooks/usePosts'
import { AttachmentGallery } from '@/components/social/AttachmentGallery'

interface PostCardProps {
    post: Post
    showComments?: boolean
}

export function PostCard({ post, showComments = true }: PostCardProps) {
    const { user } = useAuth()
    const [showMenu, setShowMenu] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const deletePost = useDeletePost()

    const isOwnPost = user?.id === post.author_id
    const shouldTruncate = post.content.length > 300

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this post?')) {
            await deletePost.mutateAsync(post.id)
        }
    }

    return (
        <article className="bg-surface border border-border rounded-card p-6 hover:border-muted transition-colors">
            {/* Author Header */}
            <div className="flex items-start justify-between mb-4">
                <Link href={`/app/profile/${post.author_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-background flex-shrink-0">
                        {post.author_avatar ? (
                            <Image
                                src={post.author_avatar}
                                alt={post.author_name}
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
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{post.author_name}</h3>
                        {post.author_headline && (
                            <p className="text-sm text-muted truncate">{post.author_headline}</p>
                        )}
                        <p className="text-xs text-muted">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                    </div>
                </Link>

                {/* Menu Button */}
                {isOwnPost && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-background rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-2 z-10">
                                <Link
                                    href={`/app/post/${post.id}/edit`}
                                    className="block px-4 py-2 hover:bg-background transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    Edit Post
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowMenu(false)
                                        handleDelete()
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-background transition-colors text-danger"
                                >
                                    Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <Link href={`/app/post/${post.id}`} className="block">
                <div className="mb-4">
                    <p className="text-foreground whitespace-pre-wrap">
                        {shouldTruncate && !expanded
                            ? post.content.slice(0, 300) + '...'
                            : post.content}
                    </p>
                    {shouldTruncate && (
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                setExpanded(!expanded)
                            }}
                            className="text-primary text-sm font-medium mt-2 hover:underline"
                        >
                            {expanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>

                {/* Link Preview */}
                {post.link_url && (
                    <a
                        href={post.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-border rounded-lg overflow-hidden hover:border-muted transition-colors mb-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {post.link_image_url && (
                            <div className="relative w-full h-48 bg-background">
                                <Image
                                    src={post.link_image_url}
                                    alt={post.link_title || 'Link preview'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="p-4">
                            {post.link_title && (
                                <h4 className="font-semibold text-foreground mb-1">{post.link_title}</h4>
                            )}
                            {post.link_description && (
                                <p className="text-sm text-muted line-clamp-2">{post.link_description}</p>
                            )}
                            <p className="text-xs text-muted mt-2">{new URL(post.link_url).hostname}</p>
                        </div>
                    </a>
                )}

                {/* Attachments */}
                <AttachmentGallery postId={post.id} />
            </Link>

            {/* Reaction Bar */}
            <div className="mt-4 pt-4 border-t border-border">
                <ReactionBar post={post} />
            </div>

            {/* Comments Preview */}
            {showComments && post.comment_count > 0 && (
                <Link
                    href={`/app/post/${post.id}#comments`}
                    className="block mt-4 pt-4 border-t border-border text-sm text-muted hover:text-primary transition-colors"
                >
                    View {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
                </Link>
            )}
        </article>
    )
}
