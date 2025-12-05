// src/components/MainMenu/MainMenu.tsx
import { useNavigate } from 'react-router-dom'
import { MdModeEdit, MdStarRate } from "react-icons/md"
import { IoDocumentTextSharp } from "react-icons/io5"
import { AppHeader } from '../AppHeader/AppHeader'
import './MainMenu.css'
import { useTranslation } from '../../hooks/useTranslation'

export default function MainMenu({
  onLogout,
}: {
  onLogout: () => void
}) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  return (
    <div className="mainmenu-container">
      <AppHeader showHelp={true} showLanguage={true} />
      
      <div className="mainmenu-content">
        <div className="mainmenu-grid">
          <div className="mainmenu-option" onClick={() => navigate('segment')}>
            <MdModeEdit className="mainmenu-icon" />
            <p>{t.mainMenu.segment}</p>
          </div>
          
          {/* <div className="mainmenu-option" onClick={() => navigate('rating')}>
  <MdStarRate className="mainmenu-icon" />
  <p>Rate</p>
</div> */}
          <div className="mainmenu-option" onClick={() => navigate('Documentation')}>
            <IoDocumentTextSharp className="mainmenu-icon" />
            <p>{t.mainMenu.documentation}</p>
          </div>
        </div>
        
        <div className="mainmenu-logout">
          <button onClick={onLogout}>{t.mainMenu.logout}</button>
        </div>
      </div>
    </div>
  )
}