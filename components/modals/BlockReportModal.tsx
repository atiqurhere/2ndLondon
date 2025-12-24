'use client'

import { useState } from 'react'
import { useBlockUser, useReportUser, useReportMoment } from '@/lib/hooks/useNotifications'

interface BlockReportModalProps {
    isOpen: boolean
    onClose: () => void
    targetUserId?: string
    targetMomentId?: string
    targetUserName?: string
}

const REPORT_CATEGORIES = [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'scam', label: 'Scam or Fraud' },
    { value: 'fake', label: 'Fake Profile/Moment' },
    { value: 'other', label: 'Other' },
]

export function BlockReportModal({
    isOpen,
    onClose,
    targetUserId,
    targetMomentId,
    targetUserName,
}: BlockReportModalProps) {
    const [action, setAction] = useState<'report' | 'block' | null>(null)
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [shouldBlock, setShouldBlock] = useState(false)

    const blockUser = useBlockUser()
    const reportUser = useReportUser()
    const reportMoment = useReportMoment()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (action === 'report') {
                if (targetUserId) {
                    await reportUser.mutateAsync({
                        userId: targetUserId,
                        category,
                        description,
                    })
                } else if (targetMomentId) {
                    await reportMoment.mutateAsync({
                        momentId: targetMomentId,
                        category,
                        description,
                    })
                }

                // Also block if checkbox is checked
                if (shouldBlock && targetUserId) {
                    await blockUser.mutateAsync({
                        userId: targetUserId,
                        reason: `Blocked while reporting: ${category}`,
                    })
                }
            } else if (action === 'block' && targetUserId) {
                await blockUser.mutateAsync({
                    userId: targetUserId,
                    reason: description || 'User blocked',
                })
            }

            // Reset and close
            setAction(null)
            setCategory('')
            setDescription('')
            setShouldBlock(false)
            onClose()
        } catch (error: any) {
            alert(error.message || 'Failed to submit')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {!action ? 'Report or Block' : action === 'report' ? 'Report' : 'Block User'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-foreground transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    {!action ? (
                        /* Action Selection */
                        <div className="space-y-3">
                            <p className="text-muted mb-4">
                                {targetUserName
                                    ? `What would you like to do about ${targetUserName}?`
                                    : 'What would you like to do?'}
                            </p>

                            <button
                                onClick={() => setAction('report')}
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors text-left"
                            >
                                <div className="font-semibold">Report</div>
                                <div className="text-sm text-muted">
                                    Report {targetMomentId ? 'this moment' : 'this user'} for violating
                                    community guidelines
                                </div>
                            </button>

                            {targetUserId && (
                                <button
                                    onClick={() => setAction('block')}
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors text-left"
                                >
                                    <div className="font-semibold text-error">Block User</div>
                                    <div className="text-sm text-muted">
                                        Prevent this user from contacting you
                                    </div>
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Report/Block Form */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {action === 'report' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Category *
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select a category</option>
                                            {REPORT_CATEGORIES.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Description (optional)
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            placeholder="Provide additional details..."
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        />
                                    </div>

                                    {targetUserId && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={shouldBlock}
                                                onChange={(e) => setShouldBlock(e.target.checked)}
                                                className="w-4 h-4 rounded border-border"
                                            />
                                            <span className="text-sm">Also block this user</span>
                                        </label>
                                    )}
                                </>
                            )}

                            {action === 'block' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Reason (optional)
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Why are you blocking this user?"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    />
                                    <p className="text-sm text-muted mt-2">
                                        This user will not be able to contact you or see your moments.
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAction(null)}
                                    className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={action === 'report' && !category}
                                    className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {action === 'report' ? 'Submit Report' : 'Block User'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
