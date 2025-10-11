// src/store/useAppStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AppState {
  // UI State
  sidebarVisible: boolean
  loading: boolean
  error: string | null
  
  // Actions
  toggleSidebar: () => void
  setSidebarVisible: (visible: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  sidebarVisible: true,
  loading: false,
  error: null
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarVisible: !state.sidebarVisible }), false, 'toggleSidebar'),

      setSidebarVisible: (visible) =>
        set({ sidebarVisible: visible }, false, 'setSidebarVisible'),

      setLoading: (loading) =>
        set({ loading }, false, 'setLoading'),

      setError: (error) =>
        set({ error }, false, 'setError'),

      reset: () =>
        set(initialState, false, 'reset')
    }),
    { name: 'AppStore' }
  )
)