'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getTrustLevelLabel } from '@/lib/utils/helpers'

export default function ProfilePage() {
    const { user } = useAuth()
    const router = useRouter()
    const supabase = createClient()

    const { data: profile } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user) return null

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error
            return data as any
        },
        enabled: !!user,
    })

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (!profile) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Profile</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-surface p-6 rounded-card border border-border mb-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center text-3xl">
                        👤
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-1">{profile.display_name}</h2>
                        <p className="text-muted text-sm mb-2">📍 {profile.home_area}</p>
                        <div className="flex items-center gap-3 text-sm">
                            {profile.is_verified && (
                                <span className="text-success">✓ Verified</span>
                            )}
                            <span className="text-muted">
                                {getTrustLevelLabel(profile.trust_level)}
                            </span>
                            {profile.rating_count > 0 && (
                                <span className="text-muted">
                                    ⭐ {profile.rating_avg.toFixed(1)} ({profile.rating_count} reviews)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-background rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-xs text-muted">Moments Created</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-xs text-muted">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{profile.rating_count}</div>
                        <div className="text-xs text-muted">Reviews</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <button
                    onClick={() => router.push('/app/safety')}
                    className="w-full px-4 py-3 bg-surface text-primary rounded-lg font-medium hover:bg-opacity-80 transition-all border border-border text-left flex items-center justify-between"
                >
                    <span>🛡️ Safety Center</span>
                    <span>→</span>
                </button>

                <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 bg-danger bg-opacity-10 text-danger rounded-lg font-medium hover:bg-opacity-20 transition-all"
                >
                    Sign Out
                </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-surface rounded-lg border border-border">
                <h3 className="font-semibold mb-2">Account Info</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted">Email</span>
                        <span>{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted">Member Since</span>
                        <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
