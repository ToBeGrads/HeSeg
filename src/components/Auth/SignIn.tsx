import { useState } from 'react'
import Axios from '../../utils/Axios'
import { AppHeader } from '../AppHeader/AppHeader'
import { useTranslation } from '../../hooks/useTranslation'
// css
import './SignIn.css'

export default function SignIn({ onLogin }: { onLogin: (token: string) => void }) {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await Axios.post('/Login/', { email :username, password })
      onLogin(res.data.access_token)
      console.log(res.data)  
    } catch {
      setError(t.auth.invalidUsernameOrPassword)
    }
  }

  return (
    <div className="signin-container">
      <AppHeader showHelp={true} showLanguage={true} />
    <div className='bodyw'>
    <div className='body'>
    <form className="signin-form" onSubmit={handleSubmit}>
        <h2>{t.auth.signIn}</h2>
        <input
          type="text"
          placeholder={t.auth.username}
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t.auth.password}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t.auth.login}</button>
        {error && <div className="signin-error">{error}</div>}
      </form>
    </div>
    <div className='image-side'>
      
      </div>
      </div>
    
    
      
    </div>
  )
}