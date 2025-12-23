'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateMoment } from '@/lib/hooks/useMoments'

const momentSchema = z.object({
    type: z.enum(['need', 'offer', 'free', 'swap']),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    category: z.string().min(1),
    tags: z.array(z.string()),
    reward_type: z.enum(['cash', 'swap', 'free', 'none']),
    reward_amount: z.number().optional(),
    approx_area: z.string().min(2),
    expires_in_hours: z.number().min(2).max(12),
    quiet_mode: z.boolean(),
    requires_verified: z.boolean(),
})

type MomentForm = z.infer<typeof momentSchema>

const categories = [
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
    'Other',
]

export default function CreateMomentPage() {
    const [step, setStep] = useState(1)
    const router = useRouter()
    const createMoment = useCreateMoment()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<MomentForm>({
        resolver: zodResolver(momentSchema),
        defaultValues: {
            type: 'offer',
            reward_type: 'none',
            expires_in_hours: 4,
            quiet_mode: true,
            requires_verified: false,
            tags: [],
        },
    })

    const watchType = watch('type')
    const watchRewardType = watch('reward_type')
    const watchTags = watch('tags')

    const onSubmit = async (data: MomentForm) => {
        console.log('Form submitted:', data)
        try {
            const expiresAt = new Date()
            expiresAt.setHours(expiresAt.getHours() + data.expires_in_hours)

            console.log('Creating moment with data:', {
                ...data,
                expires_at: expiresAt.toISOString(),
            })

            await createMoment.mutateAsync({
                ...data,
                expires_at: expiresAt.toISOString(),
                // In a real app, you'd get actual coordinates from geocoding or user location
                lat: 51.5074, // London default
                lng: -0.1278,
                radius_m: 1500,
            })

            console.log('Moment created successfully')
            router.push('/app/feed')
        } catch (error: any) {
            console.error('Create moment error:', error)
            alert(error.message || 'Failed to create moment')
        }
    }

    const nextStep = () => setStep((s) => Math.min(s + 1, 5))
    const prevStep = () => setStep((s) => Math.max(s - 1, 1))

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Create a Moment</h1>
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-background'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-surface p-6 rounded-card border border-border">
                {/* Step 1: Type */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">What type of moment?</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {(['need', 'offer', 'free', 'swap'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setValue('type', type)}
                                    className={`p-6 rounded-lg border-2 transition-all ${watchType === type
                                        ? 'border-primary bg-primary bg-opacity-10'
                                        : 'border-border hover:border-muted'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">
                                        {type === 'need' && '🙏'}
                                        {type === 'offer' && '🤝'}
                                        {type === 'free' && '🎁'}
                                        {type === 'swap' && '🔄'}
                                    </div>
                                    <div className="font-semibold capitalize">{type}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Title & Description */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Describe your moment</h2>

                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                {...register('title')}
                                type="text"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                                placeholder="e.g., Help moving furniture"
                            />
                            {errors.title && (
                                <p className="text-danger text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none"
                                placeholder="Provide details about what you need or offer..."
                            />
                            {errors.description && (
                                <p className="text-danger text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                {...register('category')}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-danger text-sm mt-1">{errors.category.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Reward */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">What's the reward?</h2>

                        <div className="grid grid-cols-2 gap-3">
                            {(['cash', 'swap', 'free', 'none'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setValue('reward_type', type)}
                                    className={`p-4 rounded-lg border-2 transition-all ${watchRewardType === type
                                        ? 'border-primary bg-primary bg-opacity-10'
                                        : 'border-border hover:border-muted'
                                        }`}
                                >
                                    <div className="font-semibold capitalize">{type}</div>
                                </button>
                            ))}
                        </div>

                        {watchRewardType === 'cash' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Amount (£)</label>
                                <input
                                    {...register('reward_amount', { valueAsNumber: true })}
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                                    placeholder="25.00"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Location */}
                {step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Where is this?</h2>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Approximate Area
                            </label>
                            <input
                                {...register('approx_area')}
                                type="text"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                                placeholder="e.g., Near Stratford, Camden area"
                            />
                            {errors.approx_area && (
                                <p className="text-danger text-sm mt-1">{errors.approx_area.message}</p>
                            )}
                            <p className="text-xs text-muted mt-1">
                                We'll show distance bands, not exact location
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 5: Expiry & Settings */}
                {step === 5 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Final settings</h2>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Expires in (hours)
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[2, 4, 8, 12].map((hours) => (
                                    <button
                                        key={hours}
                                        type="button"
                                        onClick={() => setValue('expires_in_hours', hours)}
                                        className={`p-3 rounded-lg border-2 transition-all ${watch('expires_in_hours') === hours
                                            ? 'border-primary bg-primary bg-opacity-10'
                                            : 'border-border hover:border-muted'
                                            }`}
                                    >
                                        {hours}h
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    {...register('quiet_mode')}
                                    type="checkbox"
                                    className="w-5 h-5"
                                />
                                <div>
                                    <div className="font-medium">Quiet Mode</div>
                                    <div className="text-sm text-muted">
                                        Applicants send short messages only. Chat unlocks after acceptance.
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    {...register('requires_verified')}
                                    type="checkbox"
                                    className="w-5 h-5"
                                />
                                <div>
                                    <div className="font-medium">Verified Users Only</div>
                                    <div className="text-sm text-muted">
                                        Only verified users can apply
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-6">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 px-4 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-opacity-80 transition-all"
                        >
                            Back
                        </button>
                    )}

                    {step < 5 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex-1 px-4 py-3 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            onClick={() => console.log('Create button clicked, isPending:', createMoment.isPending)}
                            disabled={createMoment.isPending}
                            className="flex-1 px-4 py-3 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {createMoment.isPending ? 'Creating...' : 'Create Moment'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
