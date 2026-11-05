import { useMemo, useState } from 'react';
import { BedDouble, Check, LockKeyhole } from 'lucide-react';
import './HotelRoomMap.css';

const money = value => `₡${Number(value || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function HotelRoomMap({ rooms = [], reservations = [], selectedRoom, onSelect, startDate, endDate, currentReservationId }) {
  const floors = useMemo(() => {
    const values = [...new Set(rooms.map(room => Number(room.piso || 1)))].sort((a, b) => a - b);
    return values.length ? values : [1];
  }, [rooms]);
  const [floor, setFloor] = useState(floors[0]);

  const overlaps = (aStart, aEnd, bStart, bEnd) => {
    if (!aStart || !aEnd || !bStart || !bEnd) return false;
    return aStart < bEnd && bStart < aEnd;
  };

  const roomReservations = room => reservations.filter(reservation => {
    if (Number(reservation.id_reservacion) === Number(currentReservationId)) return false;
    if (['cancelada', 'finalizada'].includes(reservation.estado)) return false;
    return (reservation.detalle_reservacion || []).some(detail => Number(detail.id_habitacion) === Number(room.id_habitacion));
  });

  const isBusy = room => ['mantenimiento', 'limpieza'].includes(room.estado) || roomReservations(room).some(reservation => overlaps(
    String(startDate || '').slice(0, 10),
    String(endDate || '').slice(0, 10),
    String(reservation.fecha_entrada || '').slice(0, 10),
    String(reservation.fecha_salida || '').slice(0, 10),
  ));

  const visibleRooms = rooms.filter(room => Number(room.piso || 1) === Number(floor));

  return <div className="hotel-room-map">
    <div className="hotel-room-map-head">
      <div>
        <div className="hotel-room-map-title">Habitación</div>
        <p>Seleccioná la habitación directamente desde el plano del hotel.</p>
      </div>
      <div className="hotel-room-map-legend">
        <span><i className="room-dot available"/> Disponible</span>
        <span><i className="room-dot occupied"/> Ocupada</span>
        <span><i className="room-dot selected"/> Seleccionada</span>
      </div>
    </div>

    <div className="hotel-floor-tabs">
      {floors.map(item => <button key={item} type="button" className={Number(floor) === Number(item) ? 'active' : ''} onClick={() => setFloor(item)}>Piso {item}</button>)}
    </div>

    <div className="hotel-floor-map">
      <div className="hotel-map-corridor">PASILLO PRINCIPAL</div>
      <div className="hotel-room-grid">
        {visibleRooms.map(room => {
          const busy = isBusy(room);
          const selected = Number(selectedRoom) === Number(room.id_habitacion);
          const disabled = busy;
          return <button
            key={room.id_habitacion}
            type="button"
            className={`hotel-room-card ${busy ? 'busy' : ''} ${selected ? 'selected' : ''}`}
            disabled={disabled}
            onClick={() => onSelect?.(room.id_habitacion)}
            title={busy ? 'Habitación ocupada para esas fechas' : `${room.numero} · ${money(room.precio_base)}/noche`}
          >
            <div className="hotel-room-number">{room.numero}</div>
            <BedDouble size={19}/>
            <small>{room.tipo_nombre || 'Habitación'}</small>
            <strong>{money(room.precio_base)} <span>/ noche</span></strong>
            <em>{selected ? <><Check size={12}/> Seleccionada</> : busy ? <><LockKeyhole size={12}/> Ocupada</> : 'Disponible'}</em>
          </button>;
        })}
        {!visibleRooms.length && <div className="hotel-room-empty">No hay habitaciones registradas en este piso.</div>}
      </div>
    </div>
  </div>;
}
