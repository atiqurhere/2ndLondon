import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ============================================
// NOTIFICATIONS HOOKS
// ============================================

export function useNotifications() {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { data, error } = await (supabase
                .from('notifications') as any)
                .select(`
                    *,
                    actor:actor_id(
                        id,
                        display_name,
                        username,
                        avatar_url
                    )
                `)
                .eq('user_id', user.user.id)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error
            return data
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    })
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: ['unread-notifications-count'],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) return 0

            const { count, error } = await (supabase
                .from('notifications') as any)
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.user.id)
                .eq('read', false)

            if (error) throw error
            return count || 0
        },
        refetchInterval: 30000,
    })
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const { error } = await (supabase
                .from('notifications') as any)
                .update({ read: true })
                .eq('id', notificationId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
        },
    })
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await (supabase
                .from('notifications') as any)
                .update({ read: true })
                .eq('user_id', user.user.id)
                .eq('read', false)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
        },
    })
}

// ============================================
// BLOCKS HOOKS
// ============================================

export function useBlockedUsers() {
    return useQuery({
        queryKey: ['blocked-users'],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { data, error } = await (supabase
                .from('blocks') as any)
                .select(`
                    *,
                    blocked_user:blocked_user_id(
                        id,
                        display_name,
                        username,
                        avatar_url
                    )
                `)
                .eq('user_id', user.user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
    })
}

export function useIsBlocked(userId: string) {
    return useQuery({
        queryKey: ['is-blocked', userId],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) return false

            const { data, error } = await (supabase
                .from('blocks') as any)
                .select('id')
                .eq('user_id', user.user.id)
                .eq('blocked_user_id', userId)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            return !!data
        },
        enabled: !!userId,
    })
}

export function useBlockUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await (supabase
                .from('blocks') as any)
                .insert({
                    user_id: user.user.id,
                    blocked_user_id: userId,
                    reason,
                })

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blocked-users'] })
            queryClient.invalidateQueries({ queryKey: ['is-blocked'] })
        },
    })
}

export function useUnblockUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId: string) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await (supabase
                .from('blocks') as any)
                .delete()
                .eq('user_id', user.user.id)
                .eq('blocked_user_id', userId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blocked-users'] })
            queryClient.invalidateQueries({ queryKey: ['is-blocked'] })
        },
    })
}

// ============================================
// REPORTS HOOKS
// ============================================

export function useMyReports() {
    return useQuery({
        queryKey: ['my-reports'],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { data, error } = await (supabase
                .from('reports') as any)
                .select(`
                    *,
                    reported_user:reported_user_id(
                        id,
                        display_name,
                        username,
                        avatar_url
                    ),
                    reported_moment:reported_moment_id(
                        id,
                        title
                    )
                `)
                .eq('reporter_id', user.user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
    })
}

export function useReportUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            userId,
            category,
            description,
        }: {
            userId: string
            category: string
            description?: string
        }) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await (supabase.from('reports') as any).insert({
                reporter_id: user.user.id,
                reported_user_id: userId,
                category,
                description,
            })

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-reports'] })
        },
    })
}

export function useReportMoment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            momentId,
            category,
            description,
        }: {
            momentId: string
            category: string
            description?: string
        }) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await (supabase.from('reports') as any).insert({
                reporter_id: user.user.id,
                reported_moment_id: momentId,
                category,
                description,
            })

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-reports'] })
        },
    })
}
