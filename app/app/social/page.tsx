'use client'

import { useFeed } from '@/lib/hooks/usePosts'
import { PostCard } from '@/components/social/PostCard'
import { PostComposer } from '@/components/social/PostComposer'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

export default function SocialFeedPage() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed()
    const { ref, inView } = useInView()

    // Load more when scrolling to bottom
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

    const posts = data?.pages.flat() || []

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Social Feed</h1>
                <p className="text-muted mt-1">See what's happening in your community</p>
            </div>

            {/* Post Composer */}
            <PostComposer />

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-surface border border-border rounded-card p-6 animate-pulse">
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
                    ))}
                </div>
            )}

            {/* Posts */}
            {!isLoading && posts.length > 0 && (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && posts.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background flex items-center justify-center">
                        <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted mb-6">Be the first to share something!</p>
                </div>
            )}

            {/* Load More Trigger */}
            {hasNextPage && (
                <div ref={ref} className="py-8 text-center">
                    {isFetchingNextPage ? (
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <p className="text-muted">Scroll to load more</p>
                    )}
                </div>
            )}

            {/* End of Feed */}
            {!hasNextPage && posts.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-muted">You're all caught up!</p>
                </div>
            )}
        </div>
    )
}
