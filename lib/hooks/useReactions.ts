'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ReactionType } from '@/types/social'

const supabase = createClient()

// ============================================
// REACTION MUTATIONS
// ============================================

export function useAddReaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: ReactionType }) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('post_reactions')
                .insert({
                    post_id: postId,
                    user_id: user.user.id,
                    reaction_type: reactionType,
                })

            if (error) throw error
        },
        onMutate: async ({ postId, reactionType }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['feed'] })
            await queryClient.cancelQueries({ queryKey: ['post', postId] })

            // Snapshot previous value
            const previousFeed = queryClient.getQueryData(['feed'])
            const previousPost = queryClient.getQueryData(['post', postId])

            // Optimistically update
            queryClient.setQueryData(['feed'], (old: any) => {
                if (!old) return old
                return {
                    ...old,
                    pages: old.pages.map((page: any) =>
                        page.map((post: any) =>
                            post.id === postId
                                ? {
                                    ...post,
                                    user_reaction: reactionType,
                                    [`${reactionType}_count`]: post[`${reactionType}_count`] + 1,
                                    total_reactions: post.total_reactions + 1,
                                }
                                : post
                        )
                    ),
                }
            })

            return { previousFeed, previousPost }
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousFeed) {
                queryClient.setQueryData(['feed'], context.previousFeed)
            }
            if (context?.previousPost) {
                queryClient.setQueryData(['post', variables.postId], context.previousPost)
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
        },
    })
}

export function useUpdateReaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: ReactionType }) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('post_reactions')
                .update({ reaction_type: reactionType })
                .eq('post_id', postId)
                .eq('user_id', user.user.id)

            if (error) throw error
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
        },
    })
}

export function useRemoveReaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: string) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('post_reactions')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.user.id)

            if (error) throw error
        },
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: ['feed'] })
            await queryClient.cancelQueries({ queryKey: ['post', postId] })

            const previousFeed = queryClient.getQueryData(['feed'])
            const previousPost = queryClient.getQueryData(['post', postId])

            // Optimistically update
            queryClient.setQueryData(['feed'], (old: any) => {
                if (!old) return old
                return {
                    ...old,
                    pages: old.pages.map((page: any) =>
                        page.map((post: any) => {
                            if (post.id === postId && post.user_reaction) {
                                const reactionType = post.user_reaction
                                return {
                                    ...post,
                                    user_reaction: null,
                                    [`${reactionType}_count`]: Math.max(0, post[`${reactionType}_count`] - 1),
                                    total_reactions: Math.max(0, post.total_reactions - 1),
                                }
                            }
                            return post
                        })
                    ),
                }
            })

            return { previousFeed, previousPost }
        },
        onError: (err, postId, context) => {
            if (context?.previousFeed) {
                queryClient.setQueryData(['feed'], context.previousFeed)
            }
            if (context?.previousPost) {
                queryClient.setQueryData(['post', postId], context.previousPost)
            }
        },
        onSettled: (_, __, postId) => {
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['post', postId] })
        },
    })
}

// ============================================
// TOGGLE REACTION (CONVENIENCE)
// ============================================

export function useToggleReaction() {
    const addReaction = useAddReaction()
    const updateReaction = useUpdateReaction()
    const removeReaction = useRemoveReaction()

    return useMutation({
        mutationFn: async ({
            postId,
            currentReaction,
            newReaction,
        }: {
            postId: string
            currentReaction: ReactionType | null
            newReaction: ReactionType
        }) => {
            if (!currentReaction) {
                // Add new reaction
                await addReaction.mutateAsync({ postId, reactionType: newReaction })
            } else if (currentReaction === newReaction) {
                // Remove reaction if clicking same type
                await removeReaction.mutateAsync(postId)
            } else {
                // Update to different reaction
                await updateReaction.mutateAsync({ postId, reactionType: newReaction })
            }
        },
    })
}
