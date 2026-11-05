import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import StatusBadge from '../StatusBadge/StatusBadge.jsx';
import './CalendarModal.css';

const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const WEEKDAYS = ['LU','MA','MI','JU','VI','SA','DO'];
const pad = n => String(n).padStart(2, '0');
const toKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

export default function CalendarModal({ reservations = [], onClose }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const result = [];
    for (let i = 0; i < offset; i++) result.push({ date: new Date(month.getFullYear(), month.getMonth(), i - offset + 1), outside: true });
    for (let day = 1; day <= total; day++) result.push({ date: new Date(month.getFullYear(), month.getMonth(), day), outside: false });
    while (result.length < 42) result.push({ date: new Date(month.getFullYear(), month.getMonth() + 1, result.length - total - offset + 1), outside: true });
    return result;
  }, [month]);

  const getReservations = date => reservations.filter(r => {
    const start = String(r.fecha_entrada || '').slice(0,10);
    const end = String(r.fecha_salida || '').slice(0,10);
    const key = toKey(date);
    return start && end && key >= start && key <= end;
  });

  return <div className="calendar-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="calendar-modal">
      <div className="calendar-head">
        <div><span className="calendar-kicker">VISTA DE RESERVACIONES</span><h3>Calendario</h3></div>
        <button className="calendar-close" onClick={onClose}><X size={19}/></button>
      </div>
      <div className="calendar-nav"><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))}><ChevronLeft size={18}/></button><strong>{MONTHS[month.getMonth()]} de {month.getFullYear()}</strong><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))}><ChevronRight size={18}/></button></div>
      <div className="calendar-weekdays">{WEEKDAYS.map(day => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {days.map(({date,outside},i) => <div className={`calendar-day ${outside?'outside':''}`} key={`${toKey(date)}-${i}`}>
          <span className="calendar-day-number">{date.getDate()}</span>
          <div className="calendar-events">{getReservations(date).slice(0,3).map(r => <div className="calendar-event" key={r.id_reservacion} title={`${r.cliente?.persona?.nombre || ''} ${r.cliente?.persona?.apellidos || ''}`}><span>#{r.id_reservacion} · {r.cliente?.persona?.nombre || 'Cliente'}</span><StatusBadge value={r.estado}/></div>)}{getReservations(date).length > 3 && <small>+{getReservations(date).length-3} más</small>}</div>
        </div>)}
      </div>
    </div>
  </div>;
}
