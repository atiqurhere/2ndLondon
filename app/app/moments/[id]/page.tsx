'use client'

import { use } from 'react'
import { useMoment, useApplications, useApplyToMoment, useUpdateApplication } from '@/lib/hooks/useMoments'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatTimeRemaining } from '@/lib/utils/time'
import { getRewardLabel, getTrustLevelLabel } from '@/lib/utils/helpers'
import { useState } from 'react'
import Link from 'next/link'

export default function MomentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user } = useAuth()
    const { data: moment, isLoading } = useMoment(id)
    const { data: applications } = useApplications(id)
    const applyMutation = useApplyToMoment()
    const updateApplication = useUpdateApplication()

    const [showApplyForm, setShowApplyForm] = useState(false)
    const [applicationMessage, setApplicationMessage] = useState('')

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!moment) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <p className="text-muted">Moment not found</p>
            </div>
        )
    }

    const isCreator = user?.id === moment.creator_id
    const hasApplied = applications?.some((app: any) => app.applicant_id === user?.id)

    const handleApply = async () => {
        if (!applicationMessage.trim()) {
            alert('Please enter a message')
            return
        }

        try {
            await applyMutation.mutateAsync({
                momentId: id,
                message: applicationMessage,
            })
            setShowApplyForm(false)
            setApplicationMessage('')
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleAccept = async (applicationId: string) => {
        try {
            await updateApplication.mutateAsync({
                applicationId,
                status: 'accepted',
            })
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleReject = async (applicationId: string) => {
        try {
            await updateApplication.mutateAsync({
                applicationId,
                status: 'rejected',
            })
        } catch (error: any) {
            alert(error.message)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Moment Details */}
            <div className="bg-surface p-6 rounded-card border border-border mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-background rounded capitalize">
                                {moment.type}
                            </span>
                            <span className="text-xs px-2 py-1 bg-warning text-background rounded">
                                {formatTimeRemaining(moment.expires_at)}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">{moment.title}</h1>
                    </div>
                </div>

                <p className="text-muted mb-4 whitespace-pre-wrap">{moment.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div className="text-xs text-muted mb-1">Category</div>
                        <div className="font-medium">{moment.category}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted mb-1">Reward</div>
                        <div className="font-medium text-success">
                            {getRewardLabel(moment.reward_type, moment.reward_amount)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-muted mb-1">Location</div>
                        <div className="font-medium">📍 {moment.approx_area}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted mb-1">Status</div>
                        <div className="font-medium capitalize">{moment.status}</div>
                    </div>
                </div>

                {moment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {moment.tags.map((tag: any) => (
                            <span key={tag} className="text-xs px-2 py-1 bg-background rounded">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Creator Info */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center">
                            <span className="text-xl">👤</span>
                        </div>
                        <div>
                            <div className="font-medium">{moment.creator.display_name}</div>
                            <div className="text-sm text-muted flex items-center gap-2">
                                {moment.creator.is_verified && (
                                    <span className="text-success">✓ Verified</span>
                                )}
                                <span>{getTrustLevelLabel(moment.creator.trust_level)}</span>
                                {moment.creator.rating_count > 0 && (
                                    <span>⭐ {moment.creator.rating_avg.toFixed(1)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Apply Button */}
                {!isCreator && moment.status === 'active' && !hasApplied && (
                    <div className="mt-6">
                        <button
                            onClick={() => setShowApplyForm(true)}
                            className="w-full px-4 py-3 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            Apply to this Moment
                        </button>
                    </div>
                )}

                {hasApplied && (
                    <div className="mt-6 p-3 bg-success bg-opacity-10 text-success rounded-lg text-center">
                        ✓ You've applied to this moment
                    </div>
                )}
            </div>

            {/* Apply Form */}
            {showApplyForm && (
                <div className="bg-surface p-6 rounded-card border border-border mb-6">
                    <h3 className="font-semibold mb-4">Send Application</h3>
                    <textarea
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        maxLength={240}
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none mb-2"
                        placeholder="Introduce yourself and why you're interested..."
                    />
                    <div className="text-xs text-muted mb-4">
                        {applicationMessage.length}/240 characters
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowApplyForm(false)}
                            className="flex-1 px-4 py-2 bg-background rounded-lg hover:bg-opacity-80"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={applyMutation.isPending}
                            className="flex-1 px-4 py-2 bg-primary text-background rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {applyMutation.isPending ? 'Sending...' : 'Send Application'}
                        </button>
                    </div>
                </div>
            )}

            {/* Applications (Creator Only) */}
            {isCreator && applications && applications.length > 0 && (
                <div className="bg-surface p-6 rounded-card border border-border">
                    <h3 className="font-semibold mb-4">
                        Applications ({applications.length})
                    </h3>
                    <div className="space-y-4">
                        {applications.map((app: any) => (
                            <div key={app.id} className="p-4 bg-background rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                                            <span>👤</span>
                                        </div>
                                        <div>
                                            <div className="font-medium">{app.applicant.display_name}</div>
                                            <div className="text-xs text-muted flex items-center gap-2">
                                                {app.applicant.is_verified && (
                                                    <span className="text-success">✓</span>
                                                )}
                                                <span>{getTrustLevelLabel(app.applicant.trust_level)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${app.status === 'accepted' ? 'bg-success bg-opacity-10 text-success' :
                                        app.status === 'rejected' ? 'bg-danger bg-opacity-10 text-danger' :
                                            'bg-background'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>

                                <p className="text-sm text-muted mb-3">{app.message}</p>

                                {app.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(app.id)}
                                            className="flex-1 px-3 py-2 bg-success text-background rounded text-sm font-medium hover:opacity-90"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(app.id)}
                                            className="flex-1 px-3 py-2 bg-danger text-background rounded text-sm font-medium hover:opacity-90"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {app.status === 'accepted' && (
                                    <Link
                                        href="/app/inbox"
                                        className="block text-center px-3 py-2 bg-primary text-background rounded text-sm font-medium hover:opacity-90"
                                    >
                                        Go to Chat
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
