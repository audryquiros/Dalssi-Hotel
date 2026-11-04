import { CalendarCheck, BedDouble, Users, Wallet, ArrowUpRight, Plus, Sparkles, Clock3 } from 'lucide-react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import SectionTitle from '../../components/SectionTitle/SectionTitle.jsx'
import './Dashboard.css'

const reservations = [
  { initials: 'MC', name: 'María Camacho', room: 'Habitación 204', date: '04 nov · 2:30 p. m.', status: 'Check-in', tone: 'purple' },
  { initials: 'JR', name: 'José Ramírez', room: 'Habitación 108', date: '04 nov · 3:00 p. m.', status: 'Confirmada', tone: 'blue' },
  { initials: 'AL', name: 'Andrea López', room: 'Habitación 302', date: '05 nov · 10:00 a. m.', status: 'Pendiente', tone: 'gold' },
]

export default function Dashboard() {
  return <div className="dashboard">
    <section className="welcome-banner"><div className="welcome-copy"><span><Sparkles size={13} /> BIENVENIDO DE NUEVO</span><h2>Un día excelente comienza aquí.</h2><p>Este es el resumen de la actividad de tu hotel.</p></div><div className="welcome-mark"><img src="/logo/dalssi-isotipo.png" alt="Emblema Dalssi" /></div></section>
    <div className="stats-grid">
      <StatCard label="Reservaciones activas" value="24" detail="Reservaciones registradas" icon={CalendarCheck} tone="purple" />
      <StatCard label="Habitaciones ocupadas" value="18 / 32" detail="56% de ocupación" icon={BedDouble} tone="blue" />
      <StatCard label="Huéspedes alojados" value="36" detail="Actualmente en el hotel" icon={Users} tone="sky" />
      <StatCard label="Ingresos del mes" value="₡2.450.000" detail="Monto de referencia · datos demo" icon={Wallet} tone="green" />
    </div>
    <div className="dashboard-columns">
      <section className="panel reservations-panel"><SectionTitle title="Actividad de hoy" subtitle="Movimientos recientes de reservaciones" action={<button className="text-action">Ver todas <ArrowUpRight size={14} /></button>} />
        <div className="reservation-list">{reservations.map((item) => <div className="reservation-row" key={item.name}><div className={`guest-avatar ${item.tone}`}>{item.initials}</div><div className="reservation-info"><strong>{item.name}</strong><span>{item.room}</span></div><div className="reservation-date"><span><Clock3 size={12} /> {item.date}</span><b className={`status ${item.tone}`}>{item.status}</b></div></div>)}</div>
      </section>
      <section className="panel quick-panel"><SectionTitle title="Accesos rápidos" subtitle="Tareas frecuentes" /><div className="quick-actions"><button><span className="quick-icon purple"><Plus size={17} /></span><span><strong>Nueva reservación</strong><small>Registrar una estadía</small></span><ArrowUpRight size={15} /></button><button><span className="quick-icon blue"><BedDouble size={17} /></span><span><strong>Ver habitaciones</strong><small>Consultar disponibilidad</small></span><ArrowUpRight size={15} /></button><button><span className="quick-icon sky"><Users size={17} /></span><span><strong>Registrar huésped</strong><small>Agregar información</small></span><ArrowUpRight size={15} /></button></div></section>
    </div>
    <div className="demo-note"> <Sparkles size={14} /> Esta pantalla utiliza información de demostración. Los datos reales se conectarán cuando desarrollemos el backend.</div>
  </div>
}
