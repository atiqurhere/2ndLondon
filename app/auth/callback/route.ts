import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Extract user data from OAuth provider
            const { user } = data
            const metadata = user.user_metadata

            // Update profile with OAuth data
            await (supabase.from('profiles') as any).update({
                display_name: metadata.full_name || metadata.name || user.email?.split('@')[0],
                avatar_url: metadata.avatar_url || metadata.picture,
                email: user.email,
            }).eq('id', user.id)

            // Check if user needs onboarding (no home_area set)
            const { data: profile } = await supabase
                .from('profiles')
                .select('home_area')
                .eq('id', user.id)
                .single()

            // Redirect to onboarding if profile incomplete
            if (!profile?.home_area) {
                return NextResponse.redirect(`${origin}/onboarding`)
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${origin}/app/feed`)
}
