// src/components/LanguageSwitcher/LanguageSwitcher.tsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { FiChevronUp } from 'react-icons/fi'
import './LanguageSwitcher.css'

// Flag SVG components
const UKFlag = () => (
  <svg viewBox="0 0 60 30" width="18" height="9" className="flag-icon">
    <clipPath id="uk-clip">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <clipPath id="uk-diag-clip">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
    </clipPath>
    <g clipPath="url(#uk-clip)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-clip)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
)

const FranceFlag = () => (
  <svg viewBox="0 0 30 20" width="18" height="12" className="flag-icon">
    <rect width="10" height="20" fill="#002395"/>
    <rect x="10" width="10" height="20" fill="#fff"/>
    <rect x="20" width="10" height="20" fill="#ED2939"/>
  </svg>
)

interface LanguageSwitcherProps {
  position?: 'inline' | 'sidebar-bottom'
}

export function LanguageSwitcher({ position = 'inline' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleLanguageSelect = (lang: 'en' | 'fr') => {
    setLanguage(lang)
    setIsOpen(false)
  }

  const containerClass = position === 'sidebar-bottom' 
    ? 'language-dropdown sidebar-position' 
    : 'language-dropdown'

  return (
    <div className={containerClass} ref={dropdownRef}>
      <button 
        className={`language-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {language === 'en' ? <UKFlag /> : <FranceFlag />}
        <span className="lang-code">{language.toUpperCase()}</span>
        <FiChevronUp 
          size={10} 
          className={`chevron ${isOpen ? 'rotated' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="language-menu">
          <button
            className={`lang-option ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageSelect('en')}
          >
            <UKFlag />
            <span>EN</span>
            {language === 'en' && <span className="check">✓</span>}
          </button>
          
          <button
            className={`lang-option ${language === 'fr' ? 'active' : ''}`}
            onClick={() => handleLanguageSelect('fr')}
          >
            <FranceFlag />
            <span>FR</span>
            {language === 'fr' && <span className="check">✓</span>}
          </button>
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher