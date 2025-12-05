// src/hooks/useTranslation.ts
import { useLanguageStore } from '../store/useLanguageStore'
import { translations } from '../languages/translations'
import type { TranslationKeys } from '../languages/translations'

export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore()
  
  const t = translations[language] as TranslationKeys
  
  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
    isEnglish: language === 'en',
    isFrench: language === 'fr',
  }
}

// Helper function to get nested translation
export function getNestedTranslation(obj: unknown, path: string): string {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj) as string || path
}