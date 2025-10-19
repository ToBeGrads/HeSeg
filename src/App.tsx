import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import SignIn from './components/Auth/SignIn'
import MainMenu from './components/MainMenu/MainMenu'
import SegmentList from './components/Segment/SegmentList'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import { MRIProvider } from "./Context/MRIcontext"
import './App.css'
import SegmentationRatingPage from './components/SegmentationRating/SegmentationRatingPage'


function RequireAuth({ token, children }: { token: string | null, children: React.ReactNode }) {
  const location = useLocation()
  if (!token) {
    // If not logged in, redirect to /login and remember where we were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}
function MRIViewerLayout() {
  return (
    <MRIProvider>
      <div className="app">
        <div className="app-body">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </MRIProvider>
  )
}
function MRIRatingLayout(){
  return (
    <MRIProvider>
      <div className="app">
        <div className="app-body">
          <Sidebar ratingMode={true}/>
          <SegmentationRatingPage />
        </div>
      </div>
    </MRIProvider>
  )
}
function App() {
  const { token, login, logout } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            !token
              ? <SignIn onLogin={login} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth token={token}>
              <MainMenu onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route
          path="/segment"
          element={
            <RequireAuth token={token}>
              <SegmentList token={token!} />
            </RequireAuth>
          }
        />
        // Add a route
        // Add a route
        <Route path="/rating" element={<MRIRatingLayout/>}/>
        <Route
          path="/viewer"
          element={
            <RequireAuth token={token}>
              <MRIViewerLayout />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={<Navigate to={token ? "/" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App