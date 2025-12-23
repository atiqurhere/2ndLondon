// @ts-nocheck
// This file runs in Deno runtime on Supabase Edge Functions
// TypeScript errors are expected when viewed in Node.js environment

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

Deno.serve(async (req) => {
    try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Get current time
        const now = new Date().toISOString()

        // Find expired moments
        const { data: expiredMoments, error: fetchError } = await supabase
            .from('moments')
            .select('id, creator_id, title')
            .eq('status', 'active')
            .lt('expires_at', now)

        if (fetchError) throw fetchError

        if (!expiredMoments || expiredMoments.length === 0) {
            return new Response(
                JSON.stringify({ message: 'No expired moments found', count: 0 }),
                { headers: { 'Content-Type': 'application/json' } }
            )
        }

        const momentIds = expiredMoments.map((m: any) => m.id)

        // Update moments to expired
        const { error: updateError } = await supabase
            .from('moments')
            .update({ status: 'expired' })
            .in('id', momentIds)

        if (updateError) throw updateError

        // Cancel pending applications
        const { error: cancelError } = await supabase
            .from('applications')
            .update({ status: 'cancelled' })
            .in('moment_id', momentIds)
            .eq('status', 'pending')

        if (cancelError) throw cancelError

        // Create notifications for creators
        const notifications = expiredMoments.map((moment: any) => ({
            user_id: moment.creator_id,
            type: 'moment_expired',
            title: 'Moment Expired',
            message: `Your moment "${moment.title}" has expired`,
            data: { moment_id: moment.id },
        }))

        const { error: notifError } = await supabase
            .from('notifications')
            .insert(notifications)

        if (notifError) throw notifError

        return new Response(
            JSON.stringify({
                message: 'Successfully expired moments',
                count: expiredMoments.length,
                momentIds,
            }),
            { headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error: any) {
        console.error('Error expiring moments:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})
