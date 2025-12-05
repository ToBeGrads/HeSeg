// src/store/useLanguageStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Language = 'en' | 'fr'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

export const useLanguageStore = create<LanguageState>()(
  devtools(
    persist(
      (set) => ({
        language: 'en',
        
        setLanguage: (lang) => {
          set({ language: lang }, false, 'setLanguage')
        },
        
        toggleLanguage: () => {
          set(
            (state) => ({ language: state.language === 'en' ? 'fr' : 'en' }),
            false,
            'toggleLanguage'
          )
        }
      }),
      {
        name: 'language-storage' // Persists to localStorage
      }
    ),
    { name: 'LanguageStore' }
  )
)