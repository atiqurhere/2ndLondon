'use client'

import { useAuth } from './useAuth'

// Re-export useAuth as useUser for convenience
export function useUser() {
    return useAuth()
}
