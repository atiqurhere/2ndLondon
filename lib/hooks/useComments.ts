'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Comment, CreateCommentInput, UpdateCommentInput } from '@/types/social'
import { useEffect } from 'react'

const supabase = createClient()

// ============================================
// COMMENT QUERIES
// ============================================

export function useComments(postId: string) {
    return useQuery({
        queryKey: ['comments', postId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    profiles!comments_author_id_fkey(
                        display_name,
                        username,
                        avatar_url
                    )
                `)
                .eq('post_id', postId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true })

            if (error) throw error

            // Transform data to match Comment type
            return data.map((comment: any) => ({
                id: comment.id,
                post_id: comment.post_id,
                author_id: comment.author_id,
                author_name: comment.profiles.display_name,
                author_username: comment.profiles.username,
                author_avatar: comment.profiles.avatar_url,
                body: comment.body,
                is_deleted: comment.is_deleted,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
            })) as Comment[]
        },
        enabled: !!postId,
    })
}

// ============================================
// REALTIME COMMENTS
// ============================================

export function useRealtimeComments(postId: string) {
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!postId) return

        const channel = supabase
            .channel(`comments:${postId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id=eq.${postId}`,
                },
                async (payload) => {
                    // Fetch full comment with profile data
                    const { data } = await supabase
                        .from('comments')
                        .select(`
                            *,
                            profiles!comments_author_id_fkey(
                                display_name,
                                username,
                                avatar_url
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single()

                    if (data) {
                        const newComment: Comment = {
                            id: data.id,
                            post_id: data.post_id,
                            author_id: data.author_id,
                            author_name: data.profiles.display_name,
                            author_username: data.profiles.username,
                            author_avatar: data.profiles.avatar_url,
                            body: data.body,
                            is_deleted: data.is_deleted,
                            created_at: data.created_at,
                            updated_at: data.updated_at,
                        }

                        queryClient.setQueryData(['comments', postId], (old: Comment[] = []) => {
                            // Avoid duplicates
                            if (old.some((c) => c.id === newComment.id)) return old
                            return [...old, newComment]
                        })

                        // Update comment count in feed
                        queryClient.invalidateQueries({ queryKey: ['feed'] })
                        queryClient.invalidateQueries({ queryKey: ['post', postId] })
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id=eq.${postId}`,
                },
                (payload) => {
                    queryClient.setQueryData(['comments', postId], (old: Comment[] = []) => {
                        return old.map((comment) =>
                            comment.id === payload.new.id
                                ? { ...comment, body: payload.new.body, updated_at: payload.new.updated_at }
                                : comment
                        )
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id=eq.${postId}`,
                },
                (payload) => {
                    queryClient.setQueryData(['comments', postId], (old: Comment[] = []) => {
                        return old.filter((comment) => comment.id !== payload.old.id)
                    })

                    // Update comment count
                    queryClient.invalidateQueries({ queryKey: ['feed'] })
                    queryClient.invalidateQueries({ queryKey: ['post', postId] })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [postId, queryClient])
}

// ============================================
// COMMENT MUTATIONS
// ============================================

export function useCreateComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateCommentInput) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('comments')
                .insert({
                    post_id: input.post_id,
                    author_id: user.user.id,
                    body: input.body,
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['comments', variables.post_id] })
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['post', variables.post_id] })
        },
    })
}

export function useUpdateComment(commentId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: UpdateCommentInput) => {
            const { data, error } = await supabase
                .from('comments')
                .update(input)
                .eq('id', commentId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['comments', data.post_id] })
        },
    })
}

export function useDeleteComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (commentId: string) => {
            // Soft delete
            const { data, error } = await supabase
                .from('comments')
                .update({ is_deleted: true })
                .eq('id', commentId)
                .select('post_id')
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['comments', data.post_id] })
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['post', data.post_id] })
        },
    })
}
