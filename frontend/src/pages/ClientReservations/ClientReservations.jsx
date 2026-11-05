import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api.js'
import './ClientReservations.css'

const labels = { pendiente:'Pendiente', confirmada:'Confirmada', en_curso:'En curso', finalizada:'Finalizada', cancelada:'Cancelada' }

export default function ClientReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { api.clientReservations().then(({ data }) => setReservations(data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false)) }, [])
  return <div className="client-reservations"><header className="client-simple-nav"><Link to="/cliente"><ArrowLeft size={16}/> Volver a Dalssi</Link><Link to="/cliente" className="landing-brand"><img src="/logo/dalssi-isotipo.png" alt=""/><div><strong>DALSSI</strong><span>HOTEL</span></div></Link></header><main><span className="landing-kicker"><CalendarDays size={14}/> MI ESTADÍA</span><h1>Mis reservaciones</h1><p className="client-reservations-intro">Aquí puedes encontrar tus estadías en Dalssi y volver a consultar sus detalles cuando quieras.</p>{loading ? <div className="client-empty">Cargando tus reservaciones...</div> : error ? <div className="client-error">{error}</div> : reservations.length === 0 ? <div className="client-empty"><CalendarDays size={28}/><h2>Aún no tienes reservaciones</h2><p>Cuando quieras hacer tu próxima escapada, Dalssi estará aquí.</p><Link to="/cliente" className="primary-cta">Explorar Dalssi <ChevronRight size={16}/></Link></div> : <div className="reservation-list">{reservations.map((item) => <article key={item.id_reservacion} className="reservation-card"><div className="reservation-date"><span>{item.fecha_entrada ? new Date(`${item.fecha_entrada}T00:00:00`).toLocaleDateString('es-CR',{day:'2-digit',month:'short'}) : '—'}</span><small>ENTRADA</small></div><div className="reservation-info"><span>RESERVACIÓN #{item.id_reservacion}</span><h2>{item.fecha_entrada || 'Fecha pendiente'} <b>→</b> {item.fecha_salida || 'Fecha pendiente'}</h2><p>{item.observaciones || 'Tu estadía en Dalssi Hotel.'}</p></div><span className={`reservation-status status-${item.estado}`}>{labels[item.estado] || item.estado}</span></article>)}</div>}</main></div>
}
