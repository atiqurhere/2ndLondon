'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function AdminPage() {
    const supabase = createClient()
    const queryClient = useQueryClient()

    const { data: reports, isLoading } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reports')
                .select(`
          *,
          reporter:profiles!reporter_id (
            display_name
          )
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as any
        },
    })

    const updateReport = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await (supabase
                .from('reports') as any)
                .update({ status })
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
        },
    })

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted">Moderation & Reports</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-surface p-4 rounded-card border border-border">
                    <div className="text-2xl font-bold text-warning">
                        {reports?.filter((r: any) => r.status === 'open').length || 0}
                    </div>
                    <div className="text-sm text-muted">Open Reports</div>
                </div>
                <div className="bg-surface p-4 rounded-card border border-border">
                    <div className="text-2xl font-bold text-primary">
                        {reports?.filter((r: any) => r.status === 'reviewing').length || 0}
                    </div>
                    <div className="text-sm text-muted">Under Review</div>
                </div>
                <div className="bg-surface p-4 rounded-card border border-border">
                    <div className="text-2xl font-bold text-success">
                        {reports?.filter((r: any) => r.status === 'resolved').length || 0}
                    </div>
                    <div className="text-sm text-muted">Resolved</div>
                </div>
                <div className="bg-surface p-4 rounded-card border border-border">
                    <div className="text-2xl font-bold text-muted">
                        {reports?.filter((r: any) => r.status === 'rejected').length || 0}
                    </div>
                    <div className="text-sm text-muted">Rejected</div>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-surface rounded-card border border-border">
                <div className="p-4 border-b border-border">
                    <h2 className="font-semibold">Recent Reports</h2>
                </div>

                <div className="divide-y divide-border">
                    {reports?.map((report: any) => (
                        <div key={report.id} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-1 rounded ${report.status === 'open' ? 'bg-warning bg-opacity-10 text-warning' :
                                            report.status === 'reviewing' ? 'bg-primary bg-opacity-10 text-primary' :
                                                report.status === 'resolved' ? 'bg-success bg-opacity-10 text-success' :
                                                    'bg-background text-muted'
                                            }`}>
                                            {report.status}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-background rounded capitalize">
                                            {report.target_type}
                                        </span>
                                    </div>
                                    <div className="font-medium mb-1">{report.reason}</div>
                                    <div className="text-sm text-muted mb-2">
                                        Reported by {report.reporter.display_name} • {new Date(report.created_at).toLocaleDateString()}
                                    </div>
                                    {report.details && (
                                        <div className="text-sm text-muted bg-background p-2 rounded">
                                            {report.details}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {report.status === 'open' && (
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => updateReport.mutate({ id: report.id, status: 'reviewing' })}
                                        className="px-3 py-1 bg-primary text-background rounded text-sm hover:opacity-90"
                                    >
                                        Review
                                    </button>
                                    <button
                                        onClick={() => updateReport.mutate({ id: report.id, status: 'resolved' })}
                                        className="px-3 py-1 bg-success text-background rounded text-sm hover:opacity-90"
                                    >
                                        Resolve
                                    </button>
                                    <button
                                        onClick={() => updateReport.mutate({ id: report.id, status: 'rejected' })}
                                        className="px-3 py-1 bg-danger text-background rounded text-sm hover:opacity-90"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {reports?.length === 0 && (
                        <div className="p-8 text-center text-muted">
                            No reports yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
