import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar.jsx'
import Header from '../../components/Header/Header.jsx'
import './MainLayout.css'

const pageMeta = {
  '/': { title: 'Panel principal', subtitle: 'Resumen general de la operación del hotel.' },
  '/reservaciones': { title: 'Reservaciones', subtitle: 'Administración de reservaciones.' },
  '/habitaciones': { title: 'Habitaciones', subtitle: 'Habitaciones, tipos, ubicación y disponibilidad del hotel.' },
  '/clientes': { title: 'Clientes', subtitle: 'Clientes registrados y sus datos personales.' },
  '/huespedes': { title: 'Huéspedes', subtitle: 'Huéspedes registrados y sus datos personales.' },
  '/servicios': { title: 'Servicios', subtitle: 'Servicios disponibles para las reservaciones del hotel.' },
  '/pagos': { title: 'Pagos', subtitle: 'Administración y seguimiento de pagos.' },
  '/facturas': { title: 'Facturas', subtitle: 'Emisión, impuestos y control de facturación del hotel.' },
  '/empleados': { title: 'Empleados', subtitle: 'Personal del hotel y sus datos personales.' },
}
export default function MainLayout() {
  const { pathname } = useLocation()
  return <div className="app-shell"><Sidebar /><div className="main-column"><Header title={pageMeta[pathname]?.title || 'Dalssi Hotel'} subtitle={pageMeta[pathname]?.subtitle} /><main className="page-content"><Outlet /></main><footer className="app-footer">© 2026 Dalssi Hotel <span>Una experiencia de descanso y bienestar.</span></footer></div></div>
}
