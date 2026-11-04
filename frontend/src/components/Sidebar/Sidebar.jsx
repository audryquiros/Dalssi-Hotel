import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, BedDouble, Users, UserRound, ConciergeBell, CreditCard, ReceiptText, UserCog, PanelLeftClose } from 'lucide-react'
import './Sidebar.css'

const navigation = [
  { label: 'Panel principal', path: '/', icon: LayoutDashboard },
  { label: 'Reservaciones', path: '/reservaciones', icon: CalendarDays },
  { label: 'Habitaciones', path: '/habitaciones', icon: BedDouble },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Huéspedes', path: '/huespedes', icon: UserRound },
  { label: 'Servicios', path: '/servicios', icon: ConciergeBell },
  { label: 'Pagos', path: '/pagos', icon: CreditCard },
  { label: 'Facturas', path: '/facturas', icon: ReceiptText },
  { label: 'Empleados', path: '/empleados', icon: UserCog },
]

export default function Sidebar() {
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
      <div className="sidebar-bottom"><span className="online-dot" /> Sistema listo para trabajar</div>
    </aside>
  )
}
