'use client'

import { useQuery, useMutation, useQueryClient } from '@tantml:parameter>
<parameter name="createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/social'

const supabase = createClient()

// ============================================
// FOLLOW QUERIES
// ============================================

export function useIsFollowing(userId: string) {
    return useQuery({
        queryKey: ['is-following', userId],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('is_following', {
                target_user_id: userId,
            })

            if (error) throw error
            return data as boolean
        },
        enabled: !!userId,
    })
}

export function useFollowers(userId: string) {
    return useQuery({
        queryKey: ['followers', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('follows')
                .select(`
                    follower_id,
                    created_at,
                    profiles!follows_follower_id_fkey(*)
                `)
                .eq('following_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data.map((f: any) => f.profiles) as Profile[]
        },
        enabled: !!userId,
    })
}

export function useFollowing(userId: string) {
    return useQuery({
        queryKey: ['following', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('follows')
                .select(`
                    following_id,
                    created_at,
                    profiles!follows_following_id_fkey(*)
                `)
                .eq('follower_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data.map((f: any) => f.profiles) as Profile[]
        },
        enabled: !!userId,
    })
}

// ============================================
// FOLLOW MUTATIONS
// ============================================

export function useFollowUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId: string) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await supabase.from('follows').insert({
                follower_id: user.user.id,
                following_id: userId,
            })

            if (error) throw error
        },
        onMutate: async (userId) => {
            // Optimistically update
            await queryClient.cancelQueries({ queryKey: ['is-following', userId] })
            const previousValue = queryClient.getQueryData(['is-following', userId])

            queryClient.setQueryData(['is-following', userId], true)

            return { previousValue }
        },
        onError: (err, userId, context) => {
            // Rollback on error
            if (context?.previousValue !== undefined) {
                queryClient.setQueryData(['is-following', userId], context.previousValue)
            }
        },
        onSettled: (_, __, userId) => {
            queryClient.invalidateQueries({ queryKey: ['is-following', userId] })
            queryClient.invalidateQueries({ queryKey: ['followers', userId] })
            queryClient.invalidateQueries({ queryKey: ['following'] })
        },
    })
}

export function useUnfollowUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId: string) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.user.id)
                .eq('following_id', userId)

            if (error) throw error
        },
        onMutate: async (userId) => {
            await queryClient.cancelQueries({ queryKey: ['is-following', userId] })
            const previousValue = queryClient.getQueryData(['is-following', userId])

            queryClient.setQueryData(['is-following', userId], false)

            return { previousValue }
        },
        onError: (err, userId, context) => {
            if (context?.previousValue !== undefined) {
                queryClient.setQueryData(['is-following', userId], context.previousValue)
            }
        },
        onSettled: (_, __, userId) => {
            queryClient.invalidateQueries({ queryKey: ['is-following', userId] })
            queryClient.invalidateQueries({ queryKey: ['followers', userId] })
            queryClient.invalidateQueries({ queryKey: ['following'] })
        },
    })
}

// ============================================
// TOGGLE FOLLOW (CONVENIENCE)
// ============================================

export function useToggleFollow() {
    const followUser = useFollowUser()
    const unfollowUser = useUnfollowUser()

    return useMutation({
        mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
            if (isFollowing) {
                await unfollowUser.mutateAsync(userId)
            } else {
                await followUser.mutateAsync(userId)
            }
        },
    })
}
