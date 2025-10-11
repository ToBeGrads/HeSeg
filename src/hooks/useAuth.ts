import { useState } from 'react'

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt'))

  const login = (jwt: string) => {
    setToken(jwt)
    localStorage.setItem('jwt', jwt)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('jwt')
  }

  return { token, login, logout }
}