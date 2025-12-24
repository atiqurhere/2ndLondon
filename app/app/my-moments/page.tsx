'use client'

import { useMyMoments } from '@/lib/hooks/useMoments'
import { MomentCard } from '@/components/moments/MomentCard'
import { useState } from 'react'
import Link from 'next/link'

export default function MyMomentsPage() {
    const { data: moments, isLoading, error } = useMyMoments()
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

    const filteredMoments = moments?.filter((moment: any) => {
        if (filter === 'all') return true
        return moment.status === filter
    })

    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4 text-error">Error Loading Your Moments</h1>
                <p className="text-muted">{error.message}</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">My Moments</h1>
                <p className="text-muted text-sm">
                    Manage your created moments and view applications
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-surface text-muted hover:bg-surface-hover'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === 'active'
                            ? 'bg-primary text-white'
                            : 'bg-surface text-muted hover:bg-surface-hover'
                        }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === 'completed'
                            ? 'bg-primary text-white'
                            : 'bg-surface text-muted hover:bg-surface-hover'
                        }`}
                >
                    Completed
                </button>
                <button
                    onClick={() => setFilter('cancelled')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === 'cancelled'
                            ? 'bg-primary text-white'
                            : 'bg-surface text-muted hover:bg-surface-hover'
                        }`}
                >
                    Cancelled
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted mt-4">Loading your moments...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredMoments && filteredMoments.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h2 className="text-xl font-semibold mb-2">
                        {filter === 'all' ? 'No moments yet' : `No ${filter} moments`}
                    </h2>
                    <p className="text-muted mb-6">
                        {filter === 'all'
                            ? 'Create your first moment to get started'
                            : `You don't have any ${filter} moments`}
                    </p>
                    {filter === 'all' && (
                        <Link
                            href="/app/moments/new"
                            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Create Moment
                        </Link>
                    )}
                </div>
            )}

            {/* Moments List */}
            <div className="space-y-4">
                {filteredMoments?.map((moment: any) => (
                    <div key={moment.id} className="relative">
                        <MomentCard moment={moment} />

                        {/* Application Count Badge */}
                        {moment.applications && moment.applications[0]?.count > 0 && (
                            <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {moment.applications[0].count} {moment.applications[0].count === 1 ? 'application' : 'applications'}
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="mt-2 flex gap-2">
                            <Link
                                href={`/app/moment/${moment.id}`}
                                className="flex-1 px-4 py-2 bg-surface text-foreground rounded-lg hover:bg-surface-hover text-center text-sm"
                            >
                                View Details
                            </Link>
                            {moment.status === 'active' && (
                                <Link
                                    href={`/app/moment/${moment.id}/applications`}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-center text-sm"
                                >
                                    View Applications
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
