import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { injectTheme } from '@/config/theme'

export type Theme = 'dark' | 'light' | 'system'

interface ThemeState {
  theme: Theme
  systemPreference: 'dark' | 'light'
  setTheme: (theme: Theme) => void
}

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme, system: 'dark' | 'light'): 'dark' | 'light' {
  return theme === 'system' ? system : theme
}

function applyTheme(resolved: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', resolved)
  injectTheme(resolved)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      systemPreference: typeof window !== 'undefined' ? getSystemTheme() : 'dark',
      setTheme: (theme) => {
        const sys = get().systemPreference
        const resolved = resolveTheme(theme, sys)
        applyTheme(resolved)
        set({ theme })
      },
    }),
    { name: 'taptag-theme' }
  )
)

export function useResolvedTheme(): 'dark' | 'light' {
  const theme = useThemeStore((s) => s.theme)
  const systemPreference = useThemeStore((s) => s.systemPreference)
  return resolveTheme(theme, systemPreference)
}

if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const updateSystem = () => {
    const next = mq.matches ? 'dark' : 'light'
    useThemeStore.setState({ systemPreference: next })
    const { theme } = useThemeStore.getState()
    if (theme === 'system') applyTheme(next)
  }
  mq.addEventListener('change', updateSystem)
  updateSystem()
}
