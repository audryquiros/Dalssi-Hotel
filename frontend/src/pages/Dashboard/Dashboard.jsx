import { useEffect, useState } from 'react';
import { CalendarCheck, BedDouble, Users, Wallet, ArrowUpRight, Plus, Sparkles, Clock3 } from 'lucide-react';
import StatCard from '../../components/StatCard/StatCard.jsx';
import SectionTitle from '../../components/SectionTitle/SectionTitle.jsx';
import { api } from '../../services/api.js';
import './Dashboard.css';

const statusLabel = { pendiente: 'Pendiente', confirmada: 'Confirmada', en_curso: 'Check-in' };
const toneFor = { pendiente: 'gold', confirmada: 'blue', en_curso: 'purple' };
const money = (value) => `₡${Number(value || 0).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const dateText = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short' }).replace('.', '');
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard()
      .then((result) => setSummary(result.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const data = summary || { activeReservations: 0, occupiedRooms: 0, roomTotal: 0, occupancyRate: 0, guests: 0, monthlyIncome: 0, upcoming: [] };

  return <div className="dashboard">
    <section className="welcome-banner"><div className="welcome-copy"><span><Sparkles size={13} /> RESUMEN DEL HOTEL</span><h2>Un día excelente comienza aquí.</h2><p>Actividad actual basada en los datos registrados en Dalssi.</p></div><div className="welcome-mark"><img src="/logo/dalssi-isotipo.png" alt="Emblema Dalssi" /></div></section>

    {error && <div className="crud-error dashboard-error">{error}</div>}

    <div className="stats-grid">
      <StatCard label="Reservaciones activas" value={loading ? '—' : data.activeReservations} detail="Pendientes, confirmadas y en curso" icon={CalendarCheck} tone="purple" />
      <StatCard label="Habitaciones ocupadas" value={loading ? '—' : `${data.occupiedRooms} / ${data.roomTotal}`} detail={`${data.occupancyRate}% de ocupación`} icon={BedDouble} tone="blue" />
      <StatCard label="Huéspedes registrados" value={loading ? '—' : data.guests} detail="Personas registradas como huéspedes" icon={Users} tone="sky" />
      <StatCard label="Ingresos del mes" value={loading ? '—' : money(data.monthlyIncome)} detail="Pagos registrados en el mes actual" icon={Wallet} tone="green" />
    </div>

    <div className="dashboard-columns">
      <section className="panel reservations-panel"><SectionTitle title="Próximas reservaciones" subtitle="Actividad registrada en el sistema" action={<button className="text-action">Ver todas <ArrowUpRight size={14} /></button>} />
        <div className="reservation-list">
          {!loading && !data.upcoming.length && <div className="dashboard-empty">No hay reservaciones próximas.</div>}
          {data.upcoming.map((item) => {
            const tone = toneFor[item.estado] || 'blue';
            const initials = item.cliente.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
            return <div className="reservation-row" key={item.id_reservacion}>
              <div className={`guest-avatar ${tone}`}>{initials || 'RS'}</div>
              <div className="reservation-info"><strong>{item.cliente}</strong><span>Habitación {item.habitacion}</span></div>
              <div className="reservation-date"><span><Clock3 size={12} /> {dateText(item.fecha_entrada)}</span><b className={`status ${tone}`}>{statusLabel[item.estado] || item.estado}</b></div>
            </div>;
          })}
        </div>
      </section>
      <section className="panel quick-panel"><SectionTitle title="Accesos rápidos" subtitle="Tareas frecuentes" /><div className="quick-actions">
        <button><span className="quick-icon purple"><Plus size={17} /></span><span><strong>Nueva reservación</strong><small>Registrar una estadía</small></span><ArrowUpRight size={15} /></button>
        <button><span className="quick-icon blue"><BedDouble size={17} /></span><span><strong>Ver habitaciones</strong><small>Consultar disponibilidad</small></span><ArrowUpRight size={15} /></button>
        <button><span className="quick-icon sky"><Users size={17} /></span><span><strong>Registrar huésped</strong><small>Agregar información</small></span><ArrowUpRight size={15} /></button>
      </div></section>
    </div>

    <div className="dashboard-note"><Sparkles size={14} /> Datos conectados al backend de Dalssi.</div>
  </div>;
}
