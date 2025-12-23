'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export function useConversations() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('conversations')
                .select(`
          *,
          moment:moments!moment_id (
            id,
            title,
            type
          ),
          creator:profiles!creator_id (
            id,
            display_name,
            avatar_url
          ),
          other:profiles!other_id (
            id,
            display_name,
            avatar_url
          ),
          messages (
            id,
            body,
            created_at,
            sender_id
          )
        `)
                .or(`creator_id.eq.${user.user.id},other_id.eq.${user.user.id}`)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Sort by last message time
            return (data as any).sort((a: any, b: any) => {
                const aLastMsg = a.messages?.[a.messages.length - 1]?.created_at
                const bLastMsg = b.messages?.[b.messages.length - 1]?.created_at
                if (!aLastMsg) return 1
                if (!bLastMsg) return -1
                return new Date(bLastMsg).getTime() - new Date(aLastMsg).getTime()
            })
        },
    })
}

export function useConversation(id: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['conversation', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
          *,
          moment:moments!moment_id (
            id,
            title,
            type,
            quiet_mode
          ),
          creator:profiles!creator_id (
            id,
            display_name,
            avatar_url
          ),
          other:profiles!other_id (
            id,
            display_name,
            avatar_url
          )
        `)
                .eq('id', id)
                .single()

            if (error) throw error
            return data as any
        },
    })
}

export function useMessages(conversationId: string) {
    const supabase = createClient()
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('messages')
                .select(`
          *,
          sender:profiles!sender_id (
            id,
            display_name,
            avatar_url
          )
        `)
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })

            if (error) throw error
            return data as any
        },
    })

    // Subscribe to new messages
    useEffect(() => {
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, supabase, queryClient])

    return query
}

export function useSendMessage() {
    const supabase = createClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            conversationId,
            body,
        }: {
            conversationId: string
            body: string
        }) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { data, error } = await (supabase
                .from('messages') as any)
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.user.id,
                    body,
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })
}
