import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

Deno.serve(async () => {
    try {
        // Create Supabase client with service role key
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Mark expired moments
        const { data: expiredMoments, error: expireError } = await supabaseClient
            .from('moments')
            .update({ status: 'expired' })
            .eq('status', 'active')
            .lt('expires_at', new Date().toISOString())
            .select('id, creator_id, title')

        if (expireError) {
            console.error('Error expiring moments:', expireError)
            throw expireError
        }

        console.log(`Expired ${expiredMoments?.length || 0} moments`)

        // Close pending applications for expired moments
        if (expiredMoments && expiredMoments.length > 0) {
            const momentIds = expiredMoments.map(m => m.id)

            const { error: appError } = await supabaseClient
                .from('applications')
                .update({ status: 'cancelled' })
                .in('moment_id', momentIds)
                .eq('status', 'pending')

            if (appError) {
                console.error('Error cancelling applications:', appError)
            }

            // Create notifications for creators
            const notifications = expiredMoments.map(moment => ({
                user_id: moment.creator_id,
                type: 'moment_expired',
                title: 'Moment Expired',
                body: `Your moment "${moment.title}" has expired`,
                link: `/app/moments/${moment.id}`
            }))

            const { error: notifError } = await supabaseClient
                .from('notifications')
                .insert(notifications)

            if (notifError) {
                console.error('Error creating notifications:', notifError)
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                expired_count: expiredMoments?.length || 0
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
