'use client'

import Link from 'next/link'
import { formatTimeRemaining } from '@/lib/utils/time'
import { getRewardLabel, getTrustLevelLabel, truncate } from '@/lib/utils/helpers'
import { useState, useEffect } from 'react'

interface MomentCardProps {
    moment: {
        id: string
        title: string
        description: string
        category: string
        tags: string[]
        reward_type: string
        reward_amount?: number | null
        approx_area: string
        distance_band?: string
        expires_at: string
        requires_verified: boolean
        quiet_mode: boolean
        creator_trust_level: number
        creator_is_verified: boolean
        minutes_remaining?: number
    }
}

export function MomentCard({ moment }: MomentCardProps) {
    const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(moment.expires_at))

    // Update countdown every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining(formatTimeRemaining(moment.expires_at))
        }, 60000)

        return () => clearInterval(interval)
    }, [moment.expires_at])

    const isUrgent = moment.minutes_remaining !== undefined && moment.minutes_remaining < 60

    return (
        <Link href={`/app/moments/${moment.id}`}>
            <div className="bg-surface rounded-card p-4 hover:bg-opacity-80 transition-all cursor-pointer border border-border">
                {/* Header: Title + Expiry */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold leading-tight flex-1">
                        {moment.title}
                    </h3>
                    <span
                        className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${isUrgent ? 'bg-warning text-background' : 'bg-background text-muted'
                            }`}
                    >
                        {timeRemaining}
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted mb-3 line-clamp-2">
                    {truncate(moment.description, 120)}
                </p>

                {/* Location + Distance */}
                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                    <span>📍 {moment.approx_area}</span>
                    {moment.distance_band && (
                        <>
                            <span>•</span>
                            <span>{moment.distance_band}</span>
                        </>
                    )}
                </div>

                {/* Tags */}
                {moment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {moment.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="text-xs px-2 py-1 bg-background text-muted rounded"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer: Reward + Trust Badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-success">
                            {getRewardLabel(moment.reward_type, moment.reward_amount)}
                        </span>
                        {moment.quiet_mode && (
                            <span className="text-xs text-muted">🔇 Quiet</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        {moment.creator_is_verified && (
                            <span className="text-success">✓ Verified</span>
                        )}
                        <span className="text-muted">
                            {getTrustLevelLabel(moment.creator_trust_level)}
                        </span>
                    </div>
                </div>

                {moment.requires_verified && (
                    <div className="mt-2 pt-2 border-t border-border">
                        <span className="text-xs text-warning">⚠️ Verified users only</span>
                    </div>
                )}
            </div>
        </Link>
    )
}
