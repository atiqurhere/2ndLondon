'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'

export default function ProfilePage() {
    const { user } = useAuth()
    const router = useRouter()
    const supabase = createClient()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        display_name: '',
        home_area: '',
        phone: '',
    })

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single()

            if (error) throw error

            // Set form data when profile loads
            if (data) {
                setFormData({
                    display_name: data.display_name || '',
                    home_area: data.home_area || '',
                    phone: data.phone || '',
                })
            }

            return data as any
        },
        enabled: !!user,
    })

    const updateProfileMutation = useMutation({
        mutationFn: async (updates: any) => {
            const { error } = await (supabase
                .from('profiles') as any)
                .update(updates)
                .eq('id', user?.id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
            setIsEditing(false)
        },
    })

    const uploadAvatarMutation = useMutation({
        mutationFn: async (file: File) => {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Upload file
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update profile
            const { error: updateError } = await (supabase
                .from('profiles') as any)
                .update({ avatar_url: publicUrl })
                .eq('id', user?.id)

            if (updateError) throw updateError

            return publicUrl
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
        },
    })

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB')
            return
        }

        setUploading(true)
        try {
            await uploadAvatarMutation.mutateAsync(file)
        } catch (error: any) {
            alert(error.message || 'Failed to upload avatar')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = () => {
        updateProfileMutation.mutate(formData)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!profile) return null

    const trustLevelLabels = ['New', 'Basic', 'Trusted', 'Verified', 'Elite']
    const trustLevel = trustLevelLabels[profile.trust_level - 1] || 'New'

    return (
        <div className="max-w-4xl mx-auto p-4 pb-24 md:pb-4">
            {/* Profile Header */}
            <div className="bg-surface rounded-card border border-border p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-background border-4 border-primary">
                            {profile.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.display_name || 'Profile'}
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary">
                                    {profile.display_name?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>

                        {/* Upload Button */}
                        <label className="absolute bottom-0 right-0 bg-primary text-background p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                            {uploading ? (
                                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </label>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                className="text-3xl font-bold mb-2 bg-background border border-border rounded px-3 py-1 w-full"
                                placeholder="Your name"
                            />
                        ) : (
                            <h1 className="text-3xl font-bold mb-2">{profile.display_name || 'Anonymous'}</h1>
                        )}

                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                            <span className="px-3 py-1 bg-primary bg-opacity-20 text-primary rounded-full text-sm font-medium">
                                {trustLevel} User
                            </span>
                            {profile.is_verified && (
                                <span className="px-3 py-1 bg-success bg-opacity-20 text-success rounded-full text-sm font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </span>
                            )}
                        </div>

                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.home_area}
                                onChange={(e) => setFormData({ ...formData, home_area: e.target.value })}
                                className="text-muted bg-background border border-border rounded px-3 py-1 w-full"
                                placeholder="e.g., Shoreditch, Camden"
                            />
                        ) : (
                            <p className="text-muted">📍 {profile.home_area || 'Location not set'}</p>
                        )}
                    </div>

                    {/* Edit Button */}
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={updateProfileMutation.isPending}
                                    className="px-4 py-2 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false)
                                        setFormData({
                                            display_name: profile.display_name || '',
                                            home_area: profile.home_area || '',
                                            phone: profile.phone || '',
                                        })
                                    }}
                                    className="px-4 py-2 bg-surface border border-border rounded-lg font-semibold hover:bg-opacity-80 transition-all"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-surface border border-border rounded-lg font-semibold hover:bg-opacity-80 transition-all"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface rounded-card border border-border p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                        {profile.rating_avg > 0 ? profile.rating_avg.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted">Rating</div>
                </div>
                <div className="bg-surface rounded-card border border-border p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{profile.rating_count}</div>
                    <div className="text-sm text-muted">Reviews</div>
                </div>
                <div className="bg-surface rounded-card border border-border p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{profile.trust_level}</div>
                    <div className="text-sm text-muted">Trust Level</div>
                </div>
                <div className="bg-surface rounded-card border border-border p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                        {profile.is_verified ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-muted">Verified</div>
                </div>
            </div>

            {/* Contact Info */}
            {isEditing && (
                <div className="bg-surface rounded-card border border-border p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={profile.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg opacity-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-muted mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="+44 7700 900000"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="bg-surface rounded-card border border-border p-6">
                <h2 className="text-xl font-bold mb-4">Account</h2>
                <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 bg-danger text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                    Sign Out
                </button>
            </div>
        </div>
    )
}
