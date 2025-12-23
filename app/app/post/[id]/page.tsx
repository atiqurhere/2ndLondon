'use client'

import { usePost } from '@/lib/hooks/usePosts'
import { PostCard } from '@/components/social/PostCard'
import { CommentsList } from '@/components/social/CommentsList'
import { useParams, useRouter } from 'next/navigation'

export default function PostDetailPage() {
    const params = useParams()
    const router = useRouter()
    const postId = params.id as string
    const { data: post, isLoading, error } = usePost(postId)

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-surface border border-border rounded-card p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-background" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-background rounded w-1/4" />
                            <div className="h-3 bg-background rounded w-1/3" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-background rounded w-full" />
                        <div className="h-4 bg-background rounded w-5/6" />
                        <div className="h-4 bg-background rounded w-4/6" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-danger bg-opacity-10 text-danger p-6 rounded-lg text-center">
                    <h2 className="text-xl font-semibold mb-2">Post not found</h2>
                    <p className="mb-4">This post may have been deleted or you don't have permission to view it.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-danger text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
            </button>

            {/* Post */}
            <PostCard post={post} showComments={false} />

            {/* Comments Section */}
            <div id="comments" className="bg-surface border border-border rounded-card p-6">
                <h2 className="text-xl font-bold mb-6">Comments</h2>
                <CommentsList postId={postId} />
            </div>
        </div>
    )
}
