import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar.jsx'
import Header from '../../components/Header/Header.jsx'
import './MainLayout.css'

const titles = { '/': 'Panel principal', '/reservaciones': 'Reservaciones', '/habitaciones': 'Habitaciones', '/clientes': 'Clientes', '/huespedes': 'Huéspedes', '/servicios': 'Servicios', '/pagos': 'Pagos', '/facturas': 'Facturas', '/empleados': 'Empleados' }
export default function MainLayout() {
  const { pathname } = useLocation()
  return <div className="app-shell"><Sidebar /><div className="main-column"><Header title={titles[pathname] || 'Dalssi Hotel'} /><main className="page-content"><Outlet /></main><footer className="app-footer">© 2026 Dalssi Hotel <span>Una experiencia de descanso y bienestar.</span></footer></div></div>
}
