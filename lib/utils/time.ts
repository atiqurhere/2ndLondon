import { formatDistanceToNow, differenceInMinutes, format, isValid } from 'date-fns'

export function getMinutesRemaining(expiresAt: string | null | undefined): number {
    if (!expiresAt) return -1
    const date = new Date(expiresAt)
    if (!isValid(date)) return -1
    return differenceInMinutes(date, new Date())
}

export function formatTimeRemaining(expiresAt: string | null | undefined): string {
    if (!expiresAt) return 'No expiry'

    const date = new Date(expiresAt)
    if (!isValid(date)) return 'Invalid date'

    const minutes = getMinutesRemaining(expiresAt)

    if (minutes < 0) {
        return 'Expired'
    }

    if (minutes < 60) {
        return `${minutes}m`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours < 24) {
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }

    return formatDistanceToNow(date, { addSuffix: true })
}

export function formatMessageTime(timestamp: string | null | undefined): string {
    if (!timestamp) return 'Unknown'

    const date = new Date(timestamp)
    if (!isValid(date)) return 'Invalid date'

    const now = new Date()
    const diffInMinutes = differenceInMinutes(now, date)

    if (diffInMinutes < 1) {
        return 'Just now'
    }

    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
    }

    if (diffInMinutes < 1440) { // Less than 24 hours
        return format(date, 'HH:mm')
    }

    return format(date, 'MMM d, HH:mm')
}
