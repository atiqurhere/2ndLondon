'use client'

import { useFeed } from '@/lib/hooks/useMoments'
import { MomentCard } from '@/components/moments/MomentCard'

export default function SwapsPage() {
    const { data: moments, isLoading } = useFeed('swaps')

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">🔄 Skill Swaps</h1>
                <p className="text-muted text-sm">
                    Exchange skills and services
                </p>
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
