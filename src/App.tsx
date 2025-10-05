import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import MainContent from './components/MainContent'
import Sidebar from './components/Sidebar'

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar 
          isVisible={isSidebarVisible} 
          onToggle={handleToggleSidebar} 
        />
        <MainContent />
      </div>
    </div>
  )
}

export default App