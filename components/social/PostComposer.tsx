'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePost, useUploadAttachment } from '@/lib/hooks/usePosts'
import { useAuth } from '@/lib/hooks/useAuth'
import Image from 'next/image'

const postSchema = z.object({
    content: z.string().min(1, 'Post cannot be empty').max(3000, 'Post is too long'),
    link_url: z.string().url().optional().or(z.literal('')),
})

type PostForm = z.infer<typeof postSchema>

interface PostComposerProps {
    onSuccess?: () => void
}

export function PostComposer({ onSuccess }: PostComposerProps) {
    const { user } = useAuth()
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const createPost = useCreatePost()
    const uploadAttachment = useUploadAttachment()

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<PostForm>({
        resolver: zodResolver(postSchema),
    })

    const content = watch('content', '')
    const charCount = content.length

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        const validFiles = selectedFiles.filter((file) => {
            const isImage = file.type.startsWith('image/')
            const isPDF = file.type === 'application/pdf'
            const isDoc = file.type.includes('document') || file.type.includes('word')
            return isImage || isPDF || isDoc
        })

        setFiles((prev) => [...prev, ...validFiles].slice(0, 5))
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: PostForm) => {
        try {
            setUploading(true)

            // Create post first
            const post = await createPost.mutateAsync({
                content: data.content,
                link_url: data.link_url || undefined,
            })

            // Upload attachments
            if (files.length > 0) {
                await Promise.all(
                    files.map((file) =>
                        uploadAttachment.mutateAsync({
                            postId: post.id,
                            file,
                        })
                    )
                )
            }

            // Reset form
            reset()
            setFiles([])
            onSuccess?.()
        } catch (error: any) {
            alert(error.message || 'Failed to create post')
        } finally {
            setUploading(false)
        }
    }

    if (!user) return null

    return (
        <div className="bg-surface border border-border rounded-card p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Text Input */}
                <div>
                    <textarea
                        {...register('content')}
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="What's on your mind?"
                    />
                    <div className="flex items-center justify-between mt-2">
                        {errors.content && (
                            <p className="text-danger text-sm">{errors.content.message}</p>
                        )}
                        <p className={`text-sm ml-auto ${charCount > 3000 ? 'text-danger' : 'text-muted'}`}>
                            {charCount}/3000
                        </p>
                    </div>
                </div>

                {/* Link Input */}
                <div>
                    <input
                        {...register('link_url')}
                        type="url"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Add a link (optional)"
                    />
                    {errors.link_url && (
                        <p className="text-danger text-sm mt-1">{errors.link_url.message}</p>
                    )}
                </div>

                {/* File Previews */}
                {files.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {files.map((file, index) => (
                            <div key={index} className="relative group">
                                {file.type.startsWith('image/') ? (
                                    <div className="relative aspect-square rounded-lg overflow-hidden bg-background">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-square rounded-lg bg-background border border-border flex flex-col items-center justify-center p-3">
                                        <svg className="w-8 h-8 text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-xs text-muted text-center truncate w-full">
                                            {file.name}
                                        </p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        {/* File Upload */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={files.length >= 5}
                            className="p-2 hover:bg-background rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add photos or documents"
                        >
                            <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>

                        {files.length > 0 && (
                            <span className="text-sm text-muted">
                                {files.length}/5 files
                            </span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploading || createPost.isPending || charCount === 0 || charCount > 3000}
                        className="px-6 py-2 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading || createPost.isPending ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    )
}
