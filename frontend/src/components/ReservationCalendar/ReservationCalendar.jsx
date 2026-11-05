import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { enumLabel } from '../EnumBadge/EnumBadge.jsx';
import './ReservationCalendar.css';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEKDAYS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

const STATUS_CLASS = {
  pendiente: 'pending',
  confirmada: 'confirmed',
  en_curso: 'active',
  finalizada: 'finished',
  cancelada: 'cancelled',
};

const parseDate = value => {
  if (!value) return null;
  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const formatDate = value => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
};

const getDays = month => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const overlaps = (day, reservation) => {
  const start = parseDate(reservation.fecha_entrada);
  const end = parseDate(reservation.fecha_salida) || start;
  if (!start || !end) return false;
  const key = dateKey(day);
  return key >= dateKey(start) && key <= dateKey(end);
};

export default function ReservationCalendar({ reservations = [], onClose, onSelect, onMove }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const days = useMemo(() => getDays(month), [month]);

  const reservationsByDay = useMemo(() => {
    const map = new Map();
    days.forEach(day => {
      const matches = reservations.filter(reservation => overlaps(day, reservation));
      map.set(dateKey(day), matches);
    });
    return map;
  }, [days, reservations]);

  const changeMonth = amount => setMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const goToday = () => setMonth(new Date(today.getFullYear(), today.getMonth(), 1));

  return createPortal(
    <div className="reservation-calendar-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="reservation-calendar-modal" aria-label="Calendario de reservaciones">
        <header className="reservation-calendar-header">
          <div>
            <span className="reservation-calendar-kicker">PLANIFICACIÓN</span>
            <h2>Calendario de reservaciones</h2>
            <p>Visualizá las entradas y salidas del hotel por fecha.</p>
          </div>
          <button type="button" className="reservation-calendar-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </header>

        <div className="reservation-calendar-toolbar">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Mes anterior"><ChevronLeft size={18} /></button>
          <strong>{MONTHS[month.getMonth()]} de {month.getFullYear()}</strong>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Mes siguiente"><ChevronRight size={18} /></button>
          <button type="button" className="calendar-today" onClick={goToday}>Hoy</button>
        </div>

        <div className="reservation-calendar-weekdays">
          {WEEKDAYS.map(day => <span key={day}>{day}</span>)}
        </div>

        <div className="reservation-calendar-grid">
          {days.map(day => {
            const items = reservationsByDay.get(dateKey(day)) || [];
            const outside = day.getMonth() !== month.getMonth();
            const isToday = dateKey(day) === dateKey(today);
            return (
              <div
                className={`reservation-calendar-day ${outside ? 'outside' : ''} ${isToday ? 'today' : ''} ${dropTarget === dateKey(day) ? 'drop-target' : ''}`}
                key={dateKey(day)}
                onDragOver={event => { event.preventDefault(); setDropTarget(dateKey(day)); }}
                onDragLeave={() => setDropTarget(current => current === dateKey(day) ? null : current)}
                onDrop={event => {
                  event.preventDefault();
                  const payload = event.dataTransfer.getData('application/dalssi-reservation');
                  setDropTarget(null);
                  if (!payload) return;
                  try {
                    const data = JSON.parse(payload);
                    onMove?.(Number(data.id_reservacion), data.mode, data.sourceDate, dateKey(day), data.startDate, data.endDate);
                  } catch (_) {}
                }}
              >
                <span className="calendar-day-number">{day.getDate()}</span>
                <div className="calendar-events">
                  {items.slice(0, 3).map(reservation => {
                    const status = reservation.estado || 'pendiente';
                    const start = dateKey(parseDate(reservation.fecha_entrada));
                    const end = dateKey(parseDate(reservation.fecha_salida) || parseDate(reservation.fecha_entrada));
                    const current = dateKey(day);
                    const isFirst = current === start;
                    const isLast = current === end;
                    const dragMode = isFirst ? 'move' : (isLast ? 'resize-end' : null);
                    const canDrag = Boolean(dragMode);
                    const title = isFirst
                      ? `Reservación #${reservation.id_reservacion} · Arrastrá este primer día para mover toda la reservación`
                      : isLast
                        ? `Reservación #${reservation.id_reservacion} · Arrastrá este último día para alargar o acortar la estadía`
                        : `Reservación #${reservation.id_reservacion} · Este día no se puede mover`;
                    return (
                      <button
                        type="button"
                        className={`calendar-event ${STATUS_CLASS[status] || 'pending'} ${isFirst ? 'calendar-event-start' : ''} ${isLast ? 'calendar-event-end' : ''} ${!canDrag ? 'calendar-event-middle' : ''} ${dragging === reservation.id_reservacion ? 'dragging' : ''}`}
                        key={`${dateKey(day)}-${reservation.id_reservacion}`}
                        title={title}
                        draggable={canDrag}
                        onDragStart={event => {
                          if (!canDrag) { event.preventDefault(); return; }
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('application/dalssi-reservation', JSON.stringify({
                            id_reservacion: reservation.id_reservacion,
                            sourceDate: current,
                            startDate: start,
                            endDate: end,
                            mode: dragMode,
                          }));
                          setDragging(reservation.id_reservacion);
                        }}
                        onDragEnd={() => { setDragging(null); setDropTarget(null); }}
                        onClick={() => onSelect?.(reservation)}
                      >
                        <span>#{reservation.id_reservacion}</span>
                        <small>{enumLabel(status)}</small>
                      </button>
                    );
                  })}
                  {items.length > 3 && <span className="calendar-more">+{items.length - 3} más</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="reservation-calendar-footer">
          {Object.entries(STATUS_CLASS).map(([status, className]) => (
            <span key={status}><i className={`legend-dot ${className}`} />{enumLabel(status)}</span>
          ))}
        </div>

        <div className="reservation-calendar-details">
          <strong>{reservations.length} reservaciones registradas</strong>
          <span>Arrastrá el primer día para mover la reservación. Arrastrá el último para alargar o acortar la estadía. Los días intermedios no se pueden mover.</span>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export { formatDate };
