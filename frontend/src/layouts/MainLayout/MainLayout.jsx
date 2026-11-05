import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar.jsx'
import Header from '../../components/Header/Header.jsx'
import './MainLayout.css'

const pages = {
  '/admin': { title: 'Panel principal', description: 'Resumen general de la operación del hotel.' },
  '/admin/reservaciones': { title: 'Reservaciones', description: 'Administración de reservaciones.' },
  '/admin/habitaciones': { title: 'Habitaciones', description: 'Habitaciones, tipos, ubicación y disponibilidad del hotel.' },
  '/admin/clientes': { title: 'Clientes', description: 'Clientes registrados y sus datos personales.' },
  '/admin/huespedes': { title: 'Huéspedes', description: 'Huéspedes registrados y sus datos personales.' },
  '/admin/servicios': { title: 'Servicios', description: 'Servicios disponibles para las reservaciones del hotel.' },
  '/admin/pagos': { title: 'Pagos', description: 'Registro, seguimiento y control de pagos.' },
  '/admin/facturas': { title: 'Facturas', description: 'Emisión, impuestos y control de facturación del hotel.' },
  '/admin/empleados': { title: 'Empleados', description: 'Personal del hotel y sus datos personales.' },
}

export default function MainLayout() {
  const { pathname } = useLocation()
  const page = pages[pathname] || { title: 'Dalssi Hotel', description: '' }
  return <div className="app-shell"><Sidebar /><div className="main-column"><Header title={page.title} description={page.description} /><main className="page-content"><Outlet /></main><footer className="app-footer">© 2026 Dalssi Hotel <span>Una experiencia de descanso y bienestar.</span></footer></div></div>
}
