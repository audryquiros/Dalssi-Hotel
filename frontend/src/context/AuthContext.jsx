import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function authRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'No se pudo completar la solicitud.')
  return payload
}

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('dalssi_user') || 'null') } catch { return null }
}

function destinationForUser(user) {
  if (user?.tipo_usuario === 'empleado') return '/admin'
  if (user?.tipo_usuario === 'cliente') return '/cliente'
  return '/login'
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(getStoredUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authRequest('/auth/me')
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        localStorage.setItem('dalssi_user', JSON.stringify(currentUser))
      })
      .catch(() => {
        localStorage.removeItem('dalssi_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (correo, password) => {
    const data = await authRequest('/auth/login', { method: 'POST', body: JSON.stringify({ correo, password }) })
    localStorage.setItem('dalssi_user', JSON.stringify(data.user))
    setUser(data.user)
    navigate(destinationForUser(data.user), { replace: true })
  }

  const register = async (payload) => {
    const data = await authRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
    localStorage.setItem('dalssi_user', JSON.stringify(data.user))
    setUser(data.user)
    navigate(destinationForUser(data.user), { replace: true })
  }

  const logout = async () => {
    try { await authRequest('/auth/logout', { method: 'POST' }) } catch { /* La sesión local se limpia igualmente. */ }
    localStorage.removeItem('dalssi_user')
    setUser(null)
    navigate('/login', { replace: true })
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, destinationForUser }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
  return context
}
