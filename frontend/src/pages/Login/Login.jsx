import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try { await login(correo, password) } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-brand"><img src="/logo/dalssi-isotipo.png" alt="Dalssi" /><div><strong>DALSSI</strong><span>HOTEL</span></div></div>
    <div className="auth-heading"><span>BIENVENIDO</span><h1>Iniciar sesión</h1><p>Accede a tu experiencia en Dalssi Hotel.</p></div>
    {error && <div className="auth-error">{error}</div>}
    <form onSubmit={submit} className="auth-form">
      <label>Correo electrónico<input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" required /></label>
      <label>Contraseña<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña" required /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label="Mostrar contraseña">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
      <button className="auth-submit" disabled={saving}><LogIn size={17}/>{saving ? 'Ingresando...' : 'Iniciar sesión'}</button>
    </form>
    <p className="auth-switch">¿No tienes una cuenta? <Link to="/register">Crear cuenta</Link></p>
  </section></main>
}
