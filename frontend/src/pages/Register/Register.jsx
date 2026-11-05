import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import './Register.css'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ nombre:'', apellidos:'', correo:'', password:'', confirmPassword:'' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden.')
    setSaving(true)
    try { await register({ nombre: form.nombre, apellidos: form.apellidos, correo: form.correo, password: form.password }) }
    catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const update = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }))

  return <main className="auth-page"><section className="auth-card register-card">
    <div className="auth-brand"><img src="/logo/dalssi-isotipo.png" alt="Dalssi" /><div><strong>DALSSI</strong><span>HOTEL</span></div></div>
    <div className="auth-heading"><span>PRIMER ACCESO</span><h1>Crear cuenta</h1><p>Crea tu cuenta y empieza a disfrutar de la experiencia Dalssi.</p></div>
    {error && <div className="auth-error">{error}</div>}
    <form onSubmit={submit} className="auth-form register-form">
      <div className="auth-two"><label>Nombre<input value={form.nombre} onChange={update('nombre')} required /></label><label>Apellidos<input value={form.apellidos} onChange={update('apellidos')} required /></label></div>
      <label>Correo electrónico<input type="email" value={form.correo} onChange={update('correo')} placeholder="correo@ejemplo.com" required /></label>
      <label>Contraseña<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Mínimo 8 caracteres" required minLength={8}/><button type="button" onClick={() => setShowPassword(v=>!v)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
      <label>Confirmar contraseña<input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')} required /></label>
      <button className="auth-submit" disabled={saving}><UserPlus size={17}/>{saving ? 'Creando cuenta...' : 'Crear cuenta'}</button>
    </form>
    <p className="auth-switch">¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></p>
  </section></main>
}
