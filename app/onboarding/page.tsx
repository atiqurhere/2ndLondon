'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const onboardingSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    home_area: z.string().min(2, 'Home area is required'),
    interests: z.array(z.string()).min(1, 'Select at least one interest'),
})

type OnboardingForm = z.infer<typeof onboardingSchema>

const interestOptions = [
    'Moving & Transport',
    'Home & Garden',
    'Skills & Learning',
    'Food & Cooking',
    'Tech & Digital',
    'Arts & Crafts',
    'Sports & Fitness',
    'Childcare',
    'Pet Care',
    'Events & Social',
]

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false)
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const router = useRouter()
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<OnboardingForm>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            interests: [],
        },
    })

    const toggleInterest = (interest: string) => {
        const newInterests = selectedInterests.includes(interest)
            ? selectedInterests.filter((i) => i !== interest)
            : [...selectedInterests, interest]

        setSelectedInterests(newInterests)
        setValue('interests', newInterests, { shouldValidate: true })
    }

    const onSubmit = async (data: OnboardingForm) => {
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await (supabase
                .from('profiles') as any)
                .update({
                    username: data.username,
                    home_area: data.home_area,
                    interests: data.interests,
                })
                .eq('id', user.id)

            if (error) throw error

            router.push('/app/feed')
        } catch (error: any) {
            console.error('Onboarding error:', error)
            alert(error.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome to Second London</h1>
                    <p className="text-muted">Let's set up your profile</p>
                </div>

                <div className="bg-surface p-8 rounded-card border border-border">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                                Username
                            </label>
                            <input
                                {...register('username')}
                                type="text"
                                id="username"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., john_doe"
                            />
                            {errors.username && (
                                <p className="text-danger text-sm mt-1">{errors.username.message}</p>
                            )}
                            <p className="text-xs text-muted mt-1">
                                Letters, numbers, and underscores only
                            </p>
                        </div>

                        {/* Home Area */}
                        <div>
                            <label htmlFor="home_area" className="block text-sm font-medium mb-2">
                                Home Area
                            </label>
                            <input
                                {...register('home_area')}
                                type="text"
                                id="home_area"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Shoreditch, Camden, Stratford"
                            />
                            {errors.home_area && (
                                <p className="text-danger text-sm mt-1">{errors.home_area.message}</p>
                            )}
                            <p className="text-xs text-muted mt-1">
                                This helps show you relevant nearby moments
                            </p>
                        </div>

                        {/* Interests */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Interests (select at least one)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {interestOptions.map((interest) => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedInterests.includes(interest)
                                            ? 'bg-primary text-background'
                                            : 'bg-background text-muted hover:bg-opacity-80'
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                            {errors.interests && (
                                <p className="text-danger text-sm mt-1">{errors.interests.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || selectedInterests.length === 0}
                            className="w-full px-4 py-3 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Setting up...' : 'Complete Setup'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
