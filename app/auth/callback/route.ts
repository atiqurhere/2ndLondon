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
            const { user } = data
            const metadata = user.user_metadata

            console.log('OAuth User Metadata:', metadata)

            // Extract data from various OAuth providers
            const displayName =
                metadata.full_name ||
                metadata.name ||
                metadata.display_name ||
                metadata.user_name ||
                user.email?.split('@')[0] ||
                'User'

            const avatarUrl =
                metadata.avatar_url ||
                metadata.picture ||
                metadata.photo ||
                metadata.image_url ||
                null

            const email = user.email || metadata.email

            console.log('Extracted data:', { displayName, avatarUrl, email })

            // Wait a bit to ensure profile is created by trigger
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Update profile with OAuth data
            const { error: updateError } = await (supabase.from('profiles') as any)
                .update({
                    display_name: displayName,
                    avatar_url: avatarUrl,
                    email: email,
                })
                .eq('id', user.id)

            if (updateError) {
                console.error('Profile update error:', updateError)
            } else {
                console.log('Profile updated successfully')
            }

            // Check if user needs onboarding (no home_area set)
            const { data: profile } = await (supabase
                .from('profiles')
                .select('home_area')
                .eq('id', user.id)
                .single() as any)

            // Redirect to onboarding if profile incomplete
            if (!profile?.home_area) {
                return NextResponse.redirect(`${origin}/onboarding`)
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${origin}/app/feed`)
}
