import './App.css'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import { MRIProvider } from "./Context/MRIcontext"



function App() {
  

  return (

    <MRIProvider>
      <div className="app">
        <div className="app-body">
          <Sidebar
            
          />
          <MainContent
          />
        </div>
      </div>
    </MRIProvider>
  )
}

export default App