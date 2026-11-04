import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout/MainLayout.jsx'
import Dashboard from '../pages/Dashboard/Dashboard.jsx'
import Reservaciones from '../pages/Reservaciones/Reservaciones.jsx'
import Habitaciones from '../pages/Habitaciones/Habitaciones.jsx'
import Clientes from '../pages/Clientes/Clientes.jsx'
import Huespedes from '../pages/Huespedes/Huespedes.jsx'
import Servicios from '../pages/Servicios/Servicios.jsx'
import Pagos from '../pages/Pagos/Pagos.jsx'
import Facturas from '../pages/Facturas/Facturas.jsx'
import Empleados from '../pages/Empleados/Empleados.jsx'

export default function AppRoutes() {
  return <Routes><Route element={<MainLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="reservaciones" element={<Reservaciones />} />
    <Route path="habitaciones" element={<Habitaciones />} />
    <Route path="clientes" element={<Clientes />} />
    <Route path="huespedes" element={<Huespedes />} />
    <Route path="servicios" element={<Servicios />} />
    <Route path="pagos" element={<Pagos />} />
    <Route path="facturas" element={<Facturas />} />
    <Route path="empleados" element={<Empleados />} />
  </Route></Routes>
}
