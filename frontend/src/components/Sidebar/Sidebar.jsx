import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { LayoutDashboard, CalendarDays, BedDouble, Users, UserRound, ConciergeBell, CreditCard, ReceiptText, UserCog, PanelLeftClose } from 'lucide-react'
import './Sidebar.css'

const navigation = [
  { label: 'Panel principal', path: '/admin', icon: LayoutDashboard },
  { label: 'Reservaciones', path: '/admin/reservaciones', icon: CalendarDays },
  { label: 'Habitaciones', path: '/admin/habitaciones', icon: BedDouble },
  { label: 'Clientes', path: '/admin/clientes', icon: Users },
  { label: 'Huéspedes', path: '/admin/huespedes', icon: UserRound },
  { label: 'Servicios', path: '/admin/servicios', icon: ConciergeBell },
  { label: 'Pagos', path: '/admin/pagos', icon: CreditCard },
  { label: 'Facturas', path: '/admin/facturas', icon: ReceiptText },
  { label: 'Empleados', path: '/admin/empleados', icon: UserCog },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/logo/dalssi-isotipo.png" alt="" />
        <div><strong>DALSSI</strong><span>HOTEL MANAGEMENT</span></div>
      </div>
      <div className="sidebar-caption">MENÚ PRINCIPAL</div>
      <nav className="sidebar-nav">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-user"><div className="sidebar-user-name">{user?.nombre || 'Usuario'} {user?.apellidos || ''}</div><div className="sidebar-user-email">{user?.correo || ''}</div>{user?.puesto && <span className="sidebar-user-role">{user.puesto}</span>}</div><button className="sidebar-logout" onClick={logout}>Cerrar sesión</button></div>
    </aside>
  )
}
