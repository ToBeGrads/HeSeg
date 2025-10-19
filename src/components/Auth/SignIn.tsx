import { useState } from 'react'
import Axios from '../../utils/Axios'
import { AiFillQuestionCircle } from "react-icons/ai"
import { jwtDecode } from "jwt-decode";
// css
import './SignIn.css'

export default function SignIn({ onLogin }: { onLogin: (token: string) => void }) {
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
      const decoded = jwtDecode(res.data.access_token);
      if (decoded.id){
        console.log("Login successful, user ID:", decoded.id);
      }
    } catch {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="signin-container">
    <div className='header'>
        <i>HeSeg</i>
        <button><AiFillQuestionCircle size={16}/>
            </button>
    </div>
    <div className='body'>
    <form className="signin-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <div className="signin-error">{error}</div>}
      </form>
    </div>
      
    </div>
  )
}