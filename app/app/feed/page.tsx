'use client'

import { useFeed } from '@/lib/hooks/useMoments'
import { MomentCard } from '@/components/moments/MomentCard'
import { useState, useEffect } from 'react'

export default function FeedPage() {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const { data: moments, isLoading } = useFeed('nearby', userLocation?.lat, userLocation?.lng)

    useEffect(() => {
        // Try to get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    })
                },
                (error) => {
                    console.log('Location access denied, showing all moments')
                }
            )
        }
    }, [])

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Nearby Moments</h1>
                <p className="text-muted text-sm">
                    {userLocation
                        ? 'Showing moments near you'
                        : 'Enable location to see nearby moments'}
                </p>
            </div>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted mt-4">Loading moments...</p>
                </div>
            )}

            {moments && moments.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted text-lg mb-4">No active moments nearby</p>
                    <p className="text-muted text-sm">Be the first to create one!</p>
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
