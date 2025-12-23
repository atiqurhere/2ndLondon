'use client'

import { useParams } from 'next/navigation'
import { useProfile } from '@/lib/hooks/useProfile'
import { useUserPosts } from '@/lib/hooks/usePosts'
import { useFollowers, useFollowing, useToggleFollow, useIsFollowing } from '@/lib/hooks/useFollow'
import { PostCard } from '@/components/social/PostCard'
import { useUser } from '@/lib/hooks/useUser'
import { useState } from 'react'

export default function ProfilePage() {
    const params = useParams()
    const userId = params?.userId as string
    const { user } = useUser()
    const isOwnProfile = user?.id === userId

    const { data: profile, isLoading: profileLoading } = useProfile(userId)
    const { data: posts, isLoading: postsLoading } = useUserPosts(userId)
    const { data: followers } = useFollowers(userId)
    const { data: following } = useFollowing(userId)
    const { data: isFollowing } = useIsFollowing(userId)
    const toggleFollow = useToggleFollow()

    const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts')

    if (profileLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-48 bg-surface rounded-lg mb-4"></div>
                    <div className="h-24 bg-surface rounded-lg"></div>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
                <p className="text-muted">This user doesn't exist or has been deleted.</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-surface rounded-lg p-6 mb-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {profile.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.display_name || 'User'}
                                className="w-24 h-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                                {(profile.display_name || 'U')[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                                {profile.username && (
                                    <p className="text-muted">@{profile.username}</p>
                                )}
                            </div>

                            {!isOwnProfile && user && (
                                <button
                                    onClick={() => toggleFollow.mutate({ userId, isFollowing: !!isFollowing })}
                                    disabled={toggleFollow.isPending}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isFollowing
                                        ? 'bg-surface text-foreground border border-border hover:bg-error hover:text-white'
                                        : 'bg-primary text-white hover:bg-primary/90'
                                        }`}
                                >
                                    {toggleFollow.isPending
                                        ? 'Loading...'
                                        : isFollowing
                                            ? 'Unfollow'
                                            : 'Follow'}
                                </button>
                            )}
                        </div>

                        {profile.headline && (
                            <p className="text-foreground font-medium mb-2">{profile.headline}</p>
                        )}

                        {profile.about && (
                            <p className="text-muted mb-4">{profile.about}</p>
                        )}

                        {/* Stats */}
                        <div className="flex gap-6 text-sm">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className="hover:text-primary transition-colors"
                            >
                                <span className="font-bold">{profile.post_count || 0}</span>{' '}
                                <span className="text-muted">Posts</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('followers')}
                                className="hover:text-primary transition-colors"
                            >
                                <span className="font-bold">{profile.follower_count || 0}</span>{' '}
                                <span className="text-muted">Followers</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('following')}
                                className="hover:text-primary transition-colors"
                            >
                                <span className="font-bold">{profile.following_count || 0}</span>{' '}
                                <span className="text-muted">Following</span>
                            </button>
                        </div>

                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {profile.skills.map((skill: string) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1 bg-background text-sm rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border mb-6">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`pb-3 font-medium transition-colors ${activeTab === 'posts'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted hover:text-foreground'
                            }`}
                    >
                        Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`pb-3 font-medium transition-colors ${activeTab === 'followers'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted hover:text-foreground'
                            }`}
                    >
                        Followers
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`pb-3 font-medium transition-colors ${activeTab === 'following'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted hover:text-foreground'
                            }`}
                    >
                        Following
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'posts' && (
                <div className="space-y-4">
                    {postsLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : posts?.pages && posts.pages.length > 0 && posts.pages[0].length > 0 ? (
                        posts.pages.flatMap((page: any) => page).map((post: any) => <PostCard key={post.id} post={post} />)
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted">No posts yet</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'followers' && (
                <div className="space-y-4">
                    {followers && followers.length > 0 ? (
                        followers.map((follower: any) => (
                            <div
                                key={follower.id}
                                className="bg-surface rounded-lg p-4 flex items-center gap-4"
                            >
                                {follower.avatar_url ? (
                                    <img
                                        src={follower.avatar_url}
                                        alt={follower.display_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        {(follower.display_name || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-medium">{follower.display_name}</h3>
                                    {follower.username && (
                                        <p className="text-sm text-muted">@{follower.username}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted">No followers yet</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'following' && (
                <div className="space-y-4">
                    {following && following.length > 0 ? (
                        following.map((followedUser: any) => (
                            <div
                                key={followedUser.id}
                                className="bg-surface rounded-lg p-4 flex items-center gap-4"
                            >
                                {followedUser.avatar_url ? (
                                    <img
                                        src={followedUser.avatar_url}
                                        alt={followedUser.display_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        {(followedUser.display_name || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-medium">{followedUser.display_name}</h3>
                                    {followedUser.username && (
                                        <p className="text-sm text-muted">@{followedUser.username}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted">Not following anyone yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
