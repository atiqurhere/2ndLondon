'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Post, CreatePostInput, UpdatePostInput, PostAttachment } from '@/types/social'

const supabase = createClient()

// ============================================
// FEED QUERIES
// ============================================

export function useFeed() {
    return useInfiniteQuery({
        queryKey: ['feed'],
        queryFn: async ({ pageParam = 0 }) => {
            const { data, error } = await (supabase.rpc as any)('get_feed_posts', {
                page_size: 20,
                page_offset: pageParam,
            })

            if (error) throw error
            return data as Post[]
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 20) return undefined
            return allPages.length * 20
        },
        initialPageParam: 0,
    })
}

export function useUserPosts(userId: string) {
    return useInfiniteQuery({
        queryKey: ['user-posts', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const { data, error } = await (supabase.rpc as any)('get_user_posts', {
                target_user_id: userId,
                page_size: 20,
                page_offset: pageParam,
            })

            if (error) throw error
            return data as Post[]
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 20) return undefined
            return allPages.length * 20
        },
        initialPageParam: 0,
        enabled: !!userId,
    })
}

export function usePost(postId: string) {
    return useQuery({
        queryKey: ['post', postId],
        queryFn: async () => {
            const { data, error } = await (supabase.rpc as any)('get_post_detail', {
                target_post_id: postId,
            })

            if (error) throw error
            return data[0] as Post
        },
        enabled: !!postId,
    })
}

export function usePostAttachments(postId: string) {
    return useQuery({
        queryKey: ['post-attachments', postId],
        queryFn: async () => {
            const { data, error } = await (supabase
                .from('post_attachments') as any)
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true })

            if (error) throw error
            return data as PostAttachment[]
        },
        enabled: !!postId,
    })
}

// ============================================
// POST MUTATIONS
// ============================================

export function useCreatePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreatePostInput) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { data, error } = await (supabase
                .from('posts') as any)
                .insert({
                    author_id: user.user.id,
                    ...input,
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['user-posts'] })
        },
    })
}

export function useUpdatePost(postId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: UpdatePostInput) => {
            const { data, error } = await (supabase
                .from('posts') as any)
                .update(input)
                .eq('id', postId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post', postId] })
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['user-posts'] })
        },
    })
}

export function useDeletePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: string) => {
            // Soft delete
            const { error } = await (supabase
                .from('posts') as any)
                .update({ is_deleted: true })
                .eq('id', postId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['user-posts'] })
        },
    })
}

// ============================================
// ATTACHMENT MUTATIONS
// ============================================

export function useUploadAttachment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ postId, file }: { postId: string; file: File }) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${user.user.id}/${postId}/${fileName}`

            // Upload file to storage
            const { error: uploadError } = await supabase.storage
                .from('post_attachments')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('post_attachments')
                .getPublicUrl(filePath)

            // Create attachment record
            const { data, error } = await (supabase
                .from('post_attachments') as any)
                .insert({
                    post_id: postId,
                    uploader_id: user.user.id,
                    object_path: filePath,
                    file_name: file.name,
                    mime_type: file.type,
                    size_bytes: file.size,
                })
                .select()
                .single()

            if (error) throw error
            return { ...data, public_url: urlData.publicUrl }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['post-attachments', variables.postId] })
        },
    })
}

export function useDeleteAttachment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ attachmentId, objectPath }: { attachmentId: string; objectPath: string }) => {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('post_attachments')
                .remove([objectPath])

            if (storageError) throw storageError

            // Delete record
            const { error } = await (supabase
                .from('post_attachments') as any)
                .delete()
                .eq('id', attachmentId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post-attachments'] })
        },
    })
}

// ============================================
// SAVED POSTS
// ============================================

export function useSavedPosts() {
    return useQuery({
        queryKey: ['saved-posts'],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { data, error } = await (supabase
                .from('post_saves') as any)
                .select(`
                    post_id,
                    created_at,
                    posts!inner(*)
                `)
                .eq('user_id', user.user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
    })
}

export function useSavePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: string) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await (supabase
                .from('post_saves') as any)
                .insert({
                    user_id: user.user.id,
                    post_id: postId,
                })

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['post'] })
            queryClient.invalidateQueries({ queryKey: ['saved-posts'] })
        },
    })
}

export function useUnsavePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: string) => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) throw new Error('Not authenticated')

            const { error } = await (supabase
                .from('post_saves') as any)
                .delete()
                .eq('user_id', user.user.id)
                .eq('post_id', postId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            queryClient.invalidateQueries({ queryKey: ['post'] })
            queryClient.invalidateQueries({ queryKey: ['saved-posts'] })
        },
    })
}
