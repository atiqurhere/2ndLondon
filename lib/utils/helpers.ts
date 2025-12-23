import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount)
}

export function getRewardLabel(
    rewardType: string,
    rewardAmount?: number | null,
    currency: string = 'GBP'
): string {
    switch (rewardType) {
        case 'cash':
            return rewardAmount ? formatCurrency(rewardAmount, currency) : 'Paid'
        case 'free':
            return 'Free'
        case 'swap':
            return 'Swap'
        case 'none':
            return 'No reward'
        default:
            return 'Unknown'
    }
}

export function getTrustLevelLabel(level: number): string {
    return `Level ${level}`
}

export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}
