'use client'

import { usePostAttachments } from '@/lib/hooks/usePosts'
import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AttachmentGalleryProps {
    postId: string
}

export function AttachmentGallery({ postId }: AttachmentGalleryProps) {
    const { data: attachments, isLoading } = usePostAttachments(postId)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const supabase = createClient()

    if (isLoading || !attachments || attachments.length === 0) {
        return null
    }

    const images = attachments.filter((a) => a.mime_type.startsWith('image/'))
    const documents = attachments.filter((a) => !a.mime_type.startsWith('image/'))

    const getPublicUrl = (path: string) => {
        const { data } = supabase.storage.from('post_attachments').getPublicUrl(path)
        return data.publicUrl
    }

    return (
        <div className="space-y-3">
            {/* Image Grid */}
            {images.length > 0 && (
                <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' :
                        images.length === 2 ? 'grid-cols-2' :
                            images.length === 3 ? 'grid-cols-3' :
                                'grid-cols-2'
                    }`}>
                    {images.slice(0, 4).map((attachment, index) => (
                        <div
                            key={attachment.id}
                            className="relative aspect-square rounded-lg overflow-hidden bg-background cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setLightboxIndex(index)}
                        >
                            <Image
                                src={getPublicUrl(attachment.object_path)}
                                alt={attachment.file_name}
                                fill
                                className="object-cover"
                            />
                            {index === 3 && images.length > 4 && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">
                                        +{images.length - 4}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Document List */}
            {documents.length > 0 && (
                <div className="space-y-2">
                    {documents.map((attachment) => (
                        <a
                            key={attachment.id}
                            href={getPublicUrl(attachment.object_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-muted transition-colors"
                        >
                            <div className="w-10 h-10 rounded bg-background flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{attachment.file_name}</p>
                                <p className="text-xs text-muted">
                                    {(attachment.size_bytes / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setLightboxIndex(null)
                        }}
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="relative max-w-4xl max-h-full">
                        <Image
                            src={getPublicUrl(images[lightboxIndex].object_path)}
                            alt={images[lightboxIndex].file_name}
                            width={1200}
                            height={800}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setLightboxIndex((lightboxIndex + 1) % images.length)
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
