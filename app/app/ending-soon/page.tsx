'use client'

import { useFeed } from '@/lib/hooks/useMoments'
import { MomentCard } from '@/components/moments/MomentCard'

export default function EndingSoonPage() {
    const { data: moments, isLoading, error } = useFeed('ending_soon')

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">⏰ Ending Soon</h1>
                <p className="text-muted text-sm">
                    Moments expiring soonest first
                </p>
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted mt-4">Loading moments...</p>
                </div>
            )}

            {error && (
                <div className="bg-danger bg-opacity-10 text-danger p-4 rounded-lg">
                    Error loading moments. Please try again.
                </div>
            )}

            {moments && moments.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted text-lg">No moments ending soon</p>
                </div>
            )}

            <div className="space-y-4">
                {moments?.map((moment: any) => (
                    <MomentCard key={moment.id} moment={moment} />
                ))}
            </div>
        </div>
    )
}
