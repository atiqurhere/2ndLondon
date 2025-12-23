'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface Profile {
    id: string
    display_name: string | null
    username: string | null
    avatar_url: string | null
    headline: string | null
    about: string | null
    skills: string[] | null
    home_area: string | null
    interests: string[] | null
    follower_count: number
    following_count: number
    post_count: number
    created_at: string
}

export function useProfile(userId: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            return data as Profile
        },
        enabled: !!userId,
    })
}

export function useCurrentUserProfile() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['currentUserProfile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error
            return data as Profile
        },
    })
}
