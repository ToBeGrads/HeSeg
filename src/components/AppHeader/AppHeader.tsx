// src/components/AppHeader/AppHeader.tsx
import { AiFillQuestionCircle } from 'react-icons/ai'
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher'
import './AppHeader.css'
import { useTranslation } from '../../hooks/useTranslation'
import { useNavigate } from 'react-router-dom'

interface AppHeaderProps {
  showHelp?: boolean
  showLanguage?: boolean
  link?: string
  
  onHelpClick?: () => void
}

export function AppHeader({ 
  
  showHelp = true, 
  showLanguage = true,
  link= '/Documentation',
  
}: AppHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <header className="app-header">
      <div className="app-header-left">
        <i className="app-logo">HeSeg</i>
      </div>
      
      <div className="app-header-right">
        {showLanguage && (
          <LanguageSwitcher position="inline" />
        )}
        
        {showHelp && (
          <button 
            className="app-header-btn"
            onClick={() => navigate(link)}
            title={t.header.help}
          >
            <AiFillQuestionCircle size={20} />
          </button>
        )}
      </div>
    </header>
  )
}

export default AppHeader