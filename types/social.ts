// Social Network Types

export interface Post {
    id: string
    author_id: string
    author_name: string
    author_username: string | null
    author_avatar: string | null
    author_headline: string | null
    content: string
    link_url: string | null
    link_title: string | null
    link_description: string | null
    link_image_url: string | null
    created_at: string
    updated_at: string
    like_count: number
    celebrate_count: number
    support_count: number
    love_count: number
    insightful_count: number
    total_reactions: number
    comment_count: number
    user_reaction: ReactionType | null
    is_saved: boolean
}

export type ReactionType = 'like' | 'celebrate' | 'support' | 'love' | 'insightful'

export interface PostAttachment {
    id: string
    post_id: string
    uploader_id: string
    bucket_id: string
    object_path: string
    file_name: string
    mime_type: string
    size_bytes: number
    created_at: string
}

export interface Comment {
    id: string
    post_id: string
    author_id: string
    author_name: string
    author_username: string | null
    author_avatar: string | null
    body: string
    is_deleted: boolean
    created_at: string
    updated_at: string
}

export interface Follow {
    follower_id: string
    following_id: string
    created_at: string
}

export interface Profile {
    id: string
    display_name: string
    username: string | null
    avatar_url: string | null
    headline: string | null
    about: string | null
    home_area: string
    skills: string[]
    links: ProfileLink[]
    interests: string[]
    trust_level: number
    rating_avg: number
    rating_count: number
    is_verified: boolean
    follower_count: number
    following_count: number
    post_count: number
    created_at: string
}

export interface ProfileLink {
    label: string
    url: string
}

export interface CreatePostInput {
    content: string
    link_url?: string
    link_title?: string
    link_description?: string
    link_image_url?: string
}

export interface UpdatePostInput {
    content?: string
    link_url?: string | null
    link_title?: string | null
    link_description?: string | null
    link_image_url?: string | null
}

export interface CreateCommentInput {
    post_id: string
    body: string
}

export interface UpdateCommentInput {
    body: string
}

export interface Notification {
    id: string
    user_id: string
    type: 'reaction' | 'comment' | 'follow' | 'system'
    actor_id: string | null
    actor_name?: string
    actor_avatar?: string | null
    post_id: string | null
    comment_id: string | null
    title: string
    body: string
    link: string | null
    read: boolean
    created_at: string
}
