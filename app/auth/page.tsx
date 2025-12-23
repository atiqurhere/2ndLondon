'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Invalid phone number').optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>

function AuthContent() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const mode = searchParams.get('mode') || 'login'
    const isLogin = mode === 'login'

    const loginForm = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    const signupForm = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
    })

    const handleLogin = async (data: LoginForm) => {
        setLoading(true)
        setError('')

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (authError) throw authError

            router.push('/app/feed')
        } catch (err: any) {
            setError(err.message || 'Failed to sign in')
        } finally {
            setLoading(false)
        }
    }

    const handleSignup = async (data: SignupForm) => {
        setLoading(true)
        setError('')

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        username: data.username,
                        phone: data.phone || null,
                    },
                },
            })

            if (authError) throw authError

            // Create profile with additional data
            if (authData.user) {
                const { error: profileError } = await (supabase
                    .from('profiles') as any)
                    .update({
                        display_name: data.username,
                    })
                    .eq('id', authData.user.id)

                if (profileError) console.error('Profile update error:', profileError)
            }

            router.push('/onboarding')
        } catch (err: any) {
            setError(err.message || 'Failed to sign up')
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = async (provider: 'google' | 'azure' | 'linkedin_oidc') => {
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/app/feed`,
                },
            })

            if (error) throw error
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with social provider')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-4">🌆</div>
                    <h1 className="text-3xl font-bold mb-2">
                        {isLogin ? 'Welcome Back' : 'Join Second London'}
                    </h1>
                    <p className="text-muted">
                        {isLogin
                            ? 'Sign in to your account'
                            : 'Create your account and start connecting'}
                    </p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => handleSocialLogin('google')}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg font-medium hover:bg-opacity-80 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        onClick={() => handleSocialLogin('azure')}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg font-medium hover:bg-opacity-80 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 23 23">
                            <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                            <path fill="#f35325" d="M1 1h10v10H1z" />
                            <path fill="#81bc06" d="M12 1h10v10H12z" />
                            <path fill="#05a6f0" d="M1 12h10v10H1z" />
                            <path fill="#ffba08" d="M12 12h10v10H12z" />
                        </svg>
                        Continue with Microsoft
                    </button>

                    <button
                        onClick={() => handleSocialLogin('linkedin_oidc')}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg font-medium hover:bg-opacity-80 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        Continue with LinkedIn
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-background text-muted">Or continue with email</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-danger bg-opacity-10 border border-danger rounded-lg text-danger text-sm">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                {isLogin && (
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                {...loginForm.register('email')}
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="you@example.com"
                            />
                            {loginForm.formState.errors.email && (
                                <p className="text-danger text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                {...loginForm.register('password')}
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="••••••••"
                            />
                            {loginForm.formState.errors.password && (
                                <p className="text-danger text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                )}

                {/* Signup Form */}
                {!isLogin && (
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                                Username
                            </label>
                            <input
                                {...signupForm.register('username')}
                                type="text"
                                id="username"
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="johndoe"
                            />
                            {signupForm.formState.errors.username && (
                                <p className="text-danger text-sm mt-1">{signupForm.formState.errors.username.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="signup-email" className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                {...signupForm.register('email')}
                                type="email"
                                id="signup-email"
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="you@example.com"
                            />
                            {signupForm.formState.errors.email && (
                                <p className="text-danger text-sm mt-1">{signupForm.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                Phone Number (Optional)
                            </label>
                            <input
                                {...signupForm.register('phone')}
                                type="tel"
                                id="phone"
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="+44 7700 900000"
                            />
                            {signupForm.formState.errors.phone && (
                                <p className="text-danger text-sm mt-1">{signupForm.formState.errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="signup-password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                {...signupForm.register('password')}
                                type="password"
                                id="signup-password"
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="••••••••"
                            />
                            {signupForm.formState.errors.password && (
                                <p className="text-danger text-sm mt-1">{signupForm.formState.errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                Confirm Password
                            </label>
                            <input
                                {...signupForm.register('confirmPassword')}
                                type="password"
                                id="confirmPassword"
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="••••••••"
                            />
                            {signupForm.formState.errors.confirmPassword && (
                                <p className="text-danger text-sm mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                )}

                {/* Toggle Mode */}
                <div className="mt-6 text-center text-sm text-muted">
                    {isLogin ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <a href="/auth?mode=signup" className="text-primary hover:underline font-medium">
                                Sign up
                            </a>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <a href="/auth?mode=login" className="text-primary hover:underline font-medium">
                                Sign in
                            </a>
                        </>
                    )}
                </div>

                {/* Terms */}
                <p className="mt-6 text-center text-xs text-muted">
                    By continuing, you agree to our{' '}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    )
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <AuthContent />
        </Suspense>
    )
}
