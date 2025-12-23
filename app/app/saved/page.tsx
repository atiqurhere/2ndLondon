'use client'

import { useSavedPosts } from '@/lib/hooks/usePosts'
import { PostCard } from '@/components/social/PostCard'
import { useRouter } from 'next/navigation'

export default function SavedPostsPage() {
    const router = useRouter()
    const { data: savedPosts, isLoading, error } = useSavedPosts()

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-48 bg-surface rounded-lg"></div>
                    <div className="h-48 bg-surface rounded-lg"></div>
                    <div className="h-48 bg-surface rounded-lg"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4 text-error">Error Loading Saved Posts</h1>
                <p className="text-muted mb-4">{error.message}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-muted hover:text-foreground mb-4 flex items-center gap-2"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold">Saved Posts</h1>
                <p className="text-muted text-sm mt-1">
                    Posts you've bookmarked for later
                </p>
            </div>

            {/* Saved Posts List */}
            {savedPosts && savedPosts.length > 0 ? (
                <div className="space-y-4">
                    {savedPosts.map((save: any) => (
                        <PostCard key={save.post.id} post={save.post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔖</div>
                    <h2 className="text-xl font-semibold mb-2">No saved posts yet</h2>
                    <p className="text-muted mb-6">
                        Save posts to read them later by clicking the bookmark icon
                    </p>
                    <button
                        onClick={() => router.push('/app/social')}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Browse Posts
                    </button>
                </div>
            )}
        </div>
    )
}
