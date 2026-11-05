import { Routes, Route, Navigate } from 'react-router-dom'
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
import Login from '../pages/Login/Login.jsx'
import Register from '../pages/Register/Register.jsx'
import Landing from '../pages/Landing/Landing.jsx'
import ClientHome from '../pages/ClientHome/ClientHome.jsx'
import ClientReservations from '../pages/ClientReservations/ClientReservations.jsx'
import ClientProfile from '../pages/ClientProfile/ClientProfile.jsx'
import ClientInvoice from '../pages/ClientInvoice/ClientInvoice.jsx'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute.jsx'

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute role="empleado" />}>
      <Route path="/admin" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="reservaciones" element={<Reservaciones />} />
        <Route path="habitaciones" element={<Habitaciones />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="huespedes" element={<Huespedes />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="facturas" element={<Facturas />} />
        <Route path="empleados" element={<Empleados />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute role="cliente" />}>
      <Route path="/cliente" element={<ClientHome />} />
      <Route path="/cliente/reservaciones" element={<ClientReservations />} />
      <Route path="/cliente/perfil" element={<ClientProfile />} />
      <Route path="/cliente/reservaciones/:id/factura" element={<ClientInvoice />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
