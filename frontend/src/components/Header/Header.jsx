import { Bell, Search, ChevronDown, Menu } from 'lucide-react'
import './Header.css'

export default function Header({ title }) {
  return (
    <header className="topbar">
      <div className="topbar-heading"><span className="eyebrow">DALSSI HOTEL</span><h1>{title}</h1></div>
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Buscar"><Search size={18} /></button>
        <button className="icon-button notification-button" aria-label="Notificaciones"><Bell size={18} /><i /></button>
        <div className="profile"><div className="profile-avatar">AD</div><div className="profile-copy"><strong>Administración</strong><span>Administrador</span></div><ChevronDown size={15} /></div>
      </div>
    </header>
  )
}
