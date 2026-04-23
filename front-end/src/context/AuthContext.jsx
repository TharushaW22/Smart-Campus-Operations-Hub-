import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = unauthenticated

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      return
    }
    axios.get('http://localhost:8080/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
  }, [])

  const login = (token) => {
    localStorage.setItem('token', token)
    return axios.get('http://localhost:8080/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setUser(res.data))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const refreshUser = () => {
    const token = localStorage.getItem('token')
    if (!token) return
    axios.get('http://localhost:8080/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
