import { formatDistanceToNow, differenceInMinutes, format } from 'date-fns'

export function getMinutesRemaining(expiresAt: string): number {
    return differenceInMinutes(new Date(expiresAt), new Date())
}

export function formatTimeRemaining(expiresAt: string): string {
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

    return formatDistanceToNow(new Date(expiresAt), { addSuffix: true })
}

export function formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp)
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
