import { useNavigate } from 'react-router-dom'
import { MdModeEdit } from "react-icons/md";
import { MdStarRate } from "react-icons/md";
import { IoDocumentTextSharp } from "react-icons/io5";
import './MainMenu.css'


export default function MainMenu({
  onLogout,
}: {
  onLogout: () => void
}) {
  const navigate = useNavigate()
  return (
    <div className="mainmenu-container">
      <div className="mainmenu-grid">
        <div className="mainmenu-option" onClick={() => navigate('segment')}>
          <MdModeEdit className="mainmenu-icon" />
          <p>Segment</p>
        </div>
        <div className="mainmenu-option" onClick={() => navigate('rate')}>
        <MdStarRate className="mainmenu-icon"  />
          <p>Rate</p>
        </div>
        <div className="mainmenu-option" onClick={() => navigate('documentation')}>
          <IoDocumentTextSharp className="mainmenu-icon"  />
          <p>Documentation</p>
        </div>
      </div>
      <div className='mainmenu-logout'>
      <button onClick={onLogout}>
        Logout
      </button>
      </div>
      
    </div>
  )
}