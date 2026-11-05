import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Mail, UserRound, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import './ClientProfile.css'

export default function ClientProfile() {
  const { user, logout } = useAuth()
  const initials = `${user?.nombre?.[0] || ''}${user?.apellidos?.[0] || ''}`.trim() || 'D'

  return <main className="profile-page">
    <div className="profile-background" />
    <header className="profile-nav">
      <Link to="/cliente" className="landing-brand"><img src="/logo/dalssi-isotipo.png" alt="Dalssi"/><div><strong>DALSSI</strong><span>HOTEL</span></div></Link>
      <Link to="/cliente" className="profile-back"><ArrowLeft size={15}/> Volver a mi estadía</Link>
    </header>

    <section className="profile-wrap">
      <div className="profile-heading">
        <span className="landing-kicker"><UserRound size={14}/> MI ESPACIO DALSSI</span>
        <h1>Tu perfil.</h1>
        <p>Tu información, tus datos y todo lo que hace que tu experiencia sea más tuya.</p>
      </div>

      <div className="profile-grid">
        <aside className="profile-card profile-identity">
          <div className="profile-avatar">{initials.toUpperCase()}</div>
          <h2>{user?.nombre || ''} {user?.apellidos || ''}</h2>
          <span className="profile-role">Cliente Dalssi</span>
          <div className="profile-divider" />
          <div className="profile-mini"><Mail size={16}/><span>{user?.correo || 'Sin correo registrado'}</span></div>
          <div className="profile-mini"><ShieldCheck size={16}/><span>Cuenta activa</span></div>
          <button className="profile-logout" onClick={logout}><LogOut size={15}/> Cerrar sesión</button>
        </aside>

        <div className="profile-card profile-details">
          <div className="profile-card-heading"><div><span>INFORMACIÓN PERSONAL</span><h2>Así te conocemos.</h2></div><UserRound size={21}/></div>
          <div className="profile-fields">
            <div><label>Nombre</label><strong>{user?.nombre || '—'}</strong></div>
            <div><label>Apellidos</label><strong>{user?.apellidos || '—'}</strong></div>
            <div><label>Correo electrónico</label><strong>{user?.correo || '—'}</strong></div>
            <div><label>Tipo de cuenta</label><strong>Cliente</strong></div>
          </div>
          <div className="profile-tip"><CalendarDays size={18}/><div><strong>Tu próxima estadía empieza aquí.</strong><p>Consulta tus reservaciones para ver fechas, habitaciones y detalles de tu visita.</p><Link to="/cliente/reservaciones">Ver mis reservaciones <ArrowLeft size={13}/></Link></div></div>
        </div>
      </div>
    </section>
  </main>
}
