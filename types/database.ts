export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    display_name: string
                    avatar_url: string | null
                    home_area: string
                    lat: number | null
                    lng: number | null
                    trust_level: number
                    rating_avg: number
                    rating_count: number
                    is_verified: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    display_name: string
                    avatar_url?: string | null
                    home_area: string
                    lat?: number | null
                    lng?: number | null
                    trust_level?: number
                    rating_avg?: number
                    rating_count?: number
                    is_verified?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    display_name?: string
                    avatar_url?: string | null
                    home_area?: string
                    lat?: number | null
                    lng?: number | null
                    trust_level?: number
                    rating_avg?: number
                    rating_count?: number
                    is_verified?: boolean
                    created_at?: string
                }
            }
            moments: {
                Row: {
                    id: string
                    creator_id: string
                    type: 'need' | 'offer' | 'free' | 'swap'
                    title: string
                    description: string
                    category: string
                    tags: string[]
                    reward_type: 'cash' | 'swap' | 'free' | 'none'
                    reward_amount: number | null
                    currency: string
                    approx_area: string
                    lat: number | null
                    lng: number | null
                    radius_m: number
                    expires_at: string
                    status: 'active' | 'matched' | 'expired' | 'cancelled'
                    requires_verified: boolean
                    quiet_mode: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    creator_id: string
                    type: 'need' | 'offer' | 'free' | 'swap'
                    title: string
                    description: string
                    category: string
                    tags?: string[]
                    reward_type: 'cash' | 'swap' | 'free' | 'none'
                    reward_amount?: number | null
                    currency?: string
                    approx_area: string
                    lat?: number | null
                    lng?: number | null
                    radius_m?: number
                    expires_at: string
                    status?: 'active' | 'matched' | 'expired' | 'cancelled'
                    requires_verified?: boolean
                    quiet_mode?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    creator_id?: string
                    type?: 'need' | 'offer' | 'free' | 'swap'
                    title?: string
                    description?: string
                    category?: string
                    tags?: string[]
                    reward_type?: 'cash' | 'swap' | 'free' | 'none'
                    reward_amount?: number | null
                    currency?: string
                    approx_area?: string
                    lat?: number | null
                    lng?: number | null
                    radius_m?: number
                    expires_at?: string
                    status?: 'active' | 'matched' | 'expired' | 'cancelled'
                    requires_verified?: boolean
                    quiet_mode?: boolean
                    created_at?: string
                }
            }
            applications: {
                Row: {
                    id: string
                    moment_id: string
                    applicant_id: string
                    message: string
                    status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
                    created_at: string
                }
                Insert: {
                    id?: string
                    moment_id: string
                    applicant_id: string
                    message: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled'
                    created_at?: string
                }
                Update: {
                    id?: string
                    moment_id?: string
                    applicant_id?: string
                    message?: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled'
                    created_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    moment_id: string
                    creator_id: string
                    other_id: string
                    status: 'open' | 'closed'
                    created_at: string
                }
                Insert: {
                    id?: string
                    moment_id: string
                    creator_id: string
                    other_id: string
                    status?: 'open' | 'closed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    moment_id?: string
                    creator_id?: string
                    other_id?: string
                    status?: 'open' | 'closed'
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string
                    body: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender_id: string
                    body: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    sender_id?: string
                    body?: string
                    created_at?: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    moment_id: string
                    from_id: string
                    to_id: string
                    rating: number
                    note: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    moment_id: string
                    from_id: string
                    to_id: string
                    rating: number
                    note?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    moment_id?: string
                    from_id?: string
                    to_id?: string
                    rating?: number
                    note?: string | null
                    created_at?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    reporter_id: string
                    target_type: 'moment' | 'user' | 'message'
                    target_id: string
                    reason: string
                    details: string | null
                    status: 'open' | 'reviewing' | 'resolved' | 'rejected'
                    created_at: string
                }
                Insert: {
                    id?: string
                    reporter_id: string
                    target_type: 'moment' | 'user' | 'message'
                    target_id: string
                    reason: string
                    details?: string | null
                    status?: 'open' | 'reviewing' | 'resolved' | 'rejected'
                    created_at?: string
                }
                Update: {
                    id?: string
                    reporter_id?: string
                    target_type?: 'moment' | 'user' | 'message'
                    target_id?: string
                    reason?: string
                    details?: string | null
                    status?: 'open' | 'reviewing' | 'resolved' | 'rejected'
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    title: string
                    body: string
                    link: string | null
                    read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    title: string
                    body: string
                    link?: string | null
                    read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    title?: string
                    body?: string
                    link?: string | null
                    read?: boolean
                    created_at?: string
                }
            }
            roles: {
                Row: {
                    user_id: string
                    role: 'user' | 'admin'
                }
                Insert: {
                    user_id: string
                    role?: 'user' | 'admin'
                }
                Update: {
                    user_id?: string
                    role?: 'user' | 'admin'
                }
            }
        }
        Views: {
            public_moments: {
                Row: {
                    id: string
                    creator_id: string
                    type: 'need' | 'offer' | 'free' | 'swap'
                    title: string
                    description: string
                    category: string
                    tags: string[]
                    reward_type: 'cash' | 'swap' | 'free' | 'none'
                    reward_amount: number | null
                    currency: string
                    approx_area: string
                    radius_m: number
                    expires_at: string
                    status: 'active' | 'matched' | 'expired' | 'cancelled'
                    requires_verified: boolean
                    quiet_mode: boolean
                    created_at: string
                }
            }
            public_profiles: {
                Row: {
                    id: string
                    display_name: string
                    avatar_url: string | null
                    home_area: string
                    trust_level: number
                    rating_avg: number
                    rating_count: number
                    is_verified: boolean
                    created_at: string
                }
            }
        }
        Functions: {
            get_feed: {
                Args: {
                    user_lat: number
                    user_lng: number
                    mode: string
                    feed_limit: number
                    feed_offset: number
                    verified_only: boolean
                }
                Returns: {
                    id: string
                    title: string
                    reward_type: string
                    reward_amount: number | null
                    approx_area: string
                    minutes_remaining: number
                    distance_band: string
                    tags: string[]
                    requires_verified: boolean
                    quiet_mode: boolean
                    creator_trust_level: number
                    creator_is_verified: boolean
                }[]
            }
            can_create_moment: {
                Args: {
                    user_id: string
                }
                Returns: boolean
            }
            can_apply: {
                Args: {
                    user_id: string
                }
                Returns: boolean
            }
            get_distance_band: {
                Args: {
                    lat1: number
                    lng1: number
                    lat2: number
                    lng2: number
                }
                Returns: string
            }
        }
    }
}
