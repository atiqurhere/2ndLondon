'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useFeed(mode: string, userLat?: number, userLng?: number) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['feed', mode, userLat, userLng],
        queryFn: async () => {
            const { data, error } = await (supabase.rpc as any)('get_feed', {
                user_lat: userLat ?? null,
                user_lng: userLng ?? null,
                mode: mode,
                feed_limit: 20,
                feed_offset: 0,
                verified_only: false,
            })

            if (error) throw error
            return data
        },
        refetchInterval: 60000, // Refetch every minute to update countdowns
    })
}

export function useMoment(id: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['moment', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('public_moments')
                .select(`
          *,
          creator:profiles!creator_id (
            id,
            display_name,
            avatar_url,
            trust_level,
            rating_avg,
            rating_count,
            is_verified
          )
        `)
                .eq('id', id)
                .single()

            if (error) throw error
            return data as any // Type assertion for nested relations
        },
    })
}

export function useCreateMoment() {
    const supabase = createClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (moment: any) => {
            // Check rate limit first
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { data: canCreate, error: rateLimitError } = await (supabase.rpc as any)(
                'can_create_moment',
                { check_user_id: user.user.id }
            )

            if (rateLimitError) throw rateLimitError
            if (!canCreate) throw new Error('Rate limit exceeded. Please try again later.')

            const { data, error } = await (supabase
                .from('moments') as any)
                .insert({
                    ...moment,
                    creator_id: user.user.id,
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] })
        },
    })
}

export function useApplications(momentId: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['applications', momentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('applications')
                .select(`
          *,
          applicant:profiles!applicant_id (
            id,
            display_name,
            avatar_url,
            trust_level,
            rating_avg,
            is_verified
          )
        `)
                .eq('moment_id', momentId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as any // Type assertion for nested relations
        },
    })
}

export function useApplyToMoment() {
    const supabase = createClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            momentId,
            message,
        }: {
            momentId: string
            message: string
        }) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            // Check rate limit
            const { data: canApply, error: rateLimitError } = await (supabase.rpc as any)(
                'can_apply',
                { check_user_id: user.user.id }
            )

            if (rateLimitError) throw rateLimitError
            if (!canApply) throw new Error('Rate limit exceeded. Please try again later.')

            const { data, error } = await (supabase
                .from('applications') as any)
                .insert({
                    moment_id: momentId,
                    applicant_id: user.user.id,
                    message,
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['applications', variables.momentId] })
        },
    })
}

export function useUpdateApplication() {
    const supabase = createClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            applicationId,
            status,
        }: {
            applicationId: string
            status: string
        }) => {
            const { data, error } = await (supabase
                .from('applications') as any)
                .update({ status })
                .eq('id', applicationId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['applications', data.moment_id] })
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })
}
