// src/components/AppHeader/AppHeader.tsx
import { AiFillQuestionCircle } from 'react-icons/ai'
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher'
import './AppHeader.css'
import { useTranslation } from '../../hooks/useTranslation'
import { useNavigate } from 'react-router-dom'

interface AppHeaderProps {
  showHelp?: boolean
  showLanguage?: boolean
  
  onHelpClick?: () => void
}

export function AppHeader({ 
  
  showHelp = true, 
  showLanguage = true,
  onHelpClick 
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
            onClick={() => navigate('/Documentation')}
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