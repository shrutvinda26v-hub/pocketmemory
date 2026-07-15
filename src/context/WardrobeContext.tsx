import { createContext, useContext, type ReactNode } from 'react'
import { useWardrobe, type WardrobeApi } from '../hooks/useWardrobe'

const WardrobeContext = createContext<WardrobeApi | null>(null)

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const api = useWardrobe()
  return (
    <WardrobeContext.Provider value={api}>{children}</WardrobeContext.Provider>
  )
}

export function useWardrobeContext() {
  const ctx = useContext(WardrobeContext)
  if (!ctx) throw new Error('useWardrobeContext must be used within WardrobeProvider')
  return ctx
}
