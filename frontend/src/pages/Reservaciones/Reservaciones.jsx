import { useEffect, useState } from 'react';
import { CalendarDays, Eye, Pencil, Plus, RefreshCw, Search, Trash2, X, Save, CreditCard, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import Select from '../../components/Select/Select.jsx';
import DatePicker from '../../components/DatePicker/DatePicker.jsx';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import EnumBadge from '../../components/EnumBadge/EnumBadge.jsx';
import ReservationCalendar from '../../components/ReservationCalendar/ReservationCalendar.jsx';
import HotelRoomMap from '../../components/HotelRoomMap/HotelRoomMap.jsx';
import './Reservaciones.css';
import { useConfirm } from '../../components/ConfirmDialog/ConfirmDialog.jsx';

const emptyForm = { id_cliente: '', id_empleado: '', fecha_reservacion: '', fecha_entrada: '', fecha_salida: '', estado: 'pendiente', observaciones: '' };
const states = [
  { value: 'pendiente', label: 'Pendiente' }, { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_curso', label: 'En curso' }, { value: 'finalizada', label: 'Finalizada' }, { value: 'cancelada', label: 'Cancelada' },
];
const dateText = value => value ? String(value).slice(0, 10).split('-').reverse().join('/') : '—';
const money = value => `₡${Number(value || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const personName = person => `${person?.nombre || ''} ${person?.apellidos || ''}`.trim() || '—';

const shiftDate = (value, days) => {
  const raw = String(value || '').slice(0, 10);
  const [year, month, day] = raw.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const dateDifference = (from, to) => {
  const [fy, fm, fd] = String(from).split('-').map(Number);
  const [ty, tm, td] = String(to).split('-').map(Number);
  if (![fy, fm, fd, ty, tm, td].every(Number.isFinite)) return 0;
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
};

function ReservationBreakdown({ summary }) {
  if (!summary) return <div className="reservation-summary-empty">No se pudo cargar el desglose.</div>;
  return <div className="reservation-summary">
    <div className="reservation-summary-title">Desglose de la reservación</div>
    {summary.rooms.map(item => <div className="reservation-summary-line" key={`room-${item.id_detalle_reservacion}`}><span>{item.descripcion}<small>{item.cantidad} noche(s) × {money(item.precio_unitario)}</small></span><strong>{money(item.subtotal)}</strong></div>)}
    {summary.services.map(item => <div className="reservation-summary-line" key={`service-${item.id_reservacion_servicio}`}><span>{item.descripcion}<small>{item.cantidad} × {money(item.precio_unitario)}</small></span><strong>{money(item.subtotal)}</strong></div>)}
    {!summary.rooms.length && !summary.services.length && <div className="reservation-summary-empty">No hay habitaciones ni servicios asociados todavía.</div>}
    <div className="reservation-summary-totals"><span>Hospedaje</span><strong>{money(summary.roomsSubtotal)}</strong><span>Servicios</span><strong>{money(summary.servicesSubtotal)}</strong><span>Subtotal</span><strong>{money(summary.subtotal)}</strong><span>Impuesto (13%)</span><strong>{money(summary.impuestos)}</strong><span className="grand">Total</span><strong className="grand">{money(summary.total)}</strong></div>
  </div>;
}

export default function Reservaciones() {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]), [clients, setClients] = useState([]), [employees, setEmployees] = useState([]), [services, setServices] = useState([]), [rooms, setRooms] = useState([]), [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [success, setSuccess] = useState(''), [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null), [viewing, setViewing] = useState(null), [viewingSummary, setViewingSummary] = useState(null), [calendarOpen, setCalendarOpen] = useState(false), [form, setForm] = useState(emptyForm), [saving, setSaving] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]), [serviceToAdd, setServiceToAdd] = useState(''), [serviceQuantity, setServiceQuantity] = useState(1), [editSummary, setEditSummary] = useState(null), [selectedRoom, setSelectedRoom] = useState('');

  const load = async () => { setLoading(true); setError(''); try { const result = await api.list('reservaciones'); setRows(result.data || []); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  const loadRelations = async () => { try { const [c, e, s, r, t] = await Promise.all([api.list('clientes'), api.list('empleados'), api.list('servicios'), api.list('habitaciones'), api.list('tipos_habitacion')]); setClients((c.data || []).filter(row => row.estado !== 'inactivo' && row.persona?.estado !== 'inactivo')); setEmployees((e.data || []).filter(row => row.estado !== 'inactivo' && row.persona?.estado !== 'inactivo')); setServices((s.data || []).filter(row => row.estado !== 'inactivo')); setRooms(r.data || []); setRoomTypes(t.data || []); } catch (e) { setError(e.message); } };
  useEffect(() => { load(); loadRelations(); }, []);
  useEffect(() => { if (!success) return; const timer = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(timer); }, [success]);

  const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const roomOptions = rooms.map(room => { const type = roomTypes.find(item => Number(item.id_tipo_habitacion) === Number(room.id_tipo_habitacion)); return { ...room, tipo_nombre: type?.nombre || 'Habitación', precio_base: Number(type?.precio_base || 0) }; });
  const previewServices = selectedServices.map(item => ({ id_reservacion_servicio: item.id_servicio, descripcion: item.nombre, cantidad: item.cantidad, precio_unitario: item.precio, subtotal: Math.round(item.cantidad * item.precio * 100) / 100 }));
  const selectedRoomData = roomOptions.find(room => Number(room.id_habitacion) === Number(selectedRoom));
  const previewNights = form.fecha_entrada && form.fecha_salida ? Math.max(1, dateDifference(form.fecha_entrada, form.fecha_salida)) : 0;
  const previewRooms = selectedRoomData ? [{ id_detalle_reservacion: selectedRoomData.id_habitacion, descripcion: `Habitación ${selectedRoomData.numero} · ${selectedRoomData.tipo_nombre}`, cantidad: previewNights, precio_unitario: selectedRoomData.precio_base, subtotal: Math.round(selectedRoomData.precio_base * previewNights * 100) / 100 }] : (editSummary?.rooms || []);
  const previewRoomsSubtotal = selectedRoomData ? Math.round(selectedRoomData.precio_base * previewNights * 100) / 100 : Number(editSummary?.roomsSubtotal || 0);
  const previewServicesSubtotal = Math.round(previewServices.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;
  const previewSubtotal = Math.round((previewRoomsSubtotal + previewServicesSubtotal) * 100) / 100;
  const previewTaxes = Math.round(previewSubtotal * 0.13 * 100) / 100;
  const previewSummary = { rooms: previewRooms, services: previewServices, roomsSubtotal: previewRoomsSubtotal, servicesSubtotal: previewServicesSubtotal, subtotal: previewSubtotal, impuestos: previewTaxes, total: Math.round((previewSubtotal + previewTaxes) * 100) / 100 };
  const fetchSummary = async id => { if (!id) return null; try { const result = await api.get('reservaciones', `${id}/resumen`); return result.data; } catch (e) { setError(e.message); return null; } };
  const openNew = () => { setForm(emptyForm); setSelectedRoom(''); setSelectedServices([]); setServiceToAdd(''); setServiceQuantity(1); setEditSummary(null); setEditing('new'); setError(''); };
  const openEdit = async row => {
    setForm({ id_cliente: row.id_cliente || '', id_empleado: row.id_empleado || '', fecha_reservacion: String(row.fecha_reservacion || '').slice(0, 10), fecha_entrada: String(row.fecha_entrada || '').slice(0, 10), fecha_salida: String(row.fecha_salida || '').slice(0, 10), estado: row.estado || 'pendiente', observaciones: row.observaciones || '' });
    setSelectedRoom(row.detalle_reservacion?.[0]?.id_habitacion || '');
    setSelectedServices((row.reservacion_servicios || []).map(item => ({ id_servicio: item.id_servicio, cantidad: Number(item.cantidad || 1), nombre: item.servicio?.nombre || `Servicio #${item.id_servicio}`, precio: Number(item.precio_unitario || item.servicio?.precio || 0) })));
    setServiceToAdd(''); setServiceQuantity(1); setEditSummary(null); setEditing(row.id_reservacion); setError('');
    const summary = await fetchSummary(row.id_reservacion); setEditSummary(summary);
  };
  const addService = () => { if (!serviceToAdd) return; const service = services.find(item => Number(item.id_servicio) === Number(serviceToAdd)); if (!service) return; const quantity = Math.max(1, Number(serviceQuantity || 1)); setSelectedServices(current => { const existing = current.find(item => Number(item.id_servicio) === Number(service.id_servicio)); if (existing) return current.map(item => Number(item.id_servicio) === Number(service.id_servicio) ? { ...item, cantidad: item.cantidad + quantity } : item); return [...current, { id_servicio: service.id_servicio, cantidad: quantity, nombre: service.nombre, precio: Number(service.precio || 0) }]; }); setServiceToAdd(''); setServiceQuantity(1); };
  const removeService = id => setSelectedServices(current => current.filter(item => Number(item.id_servicio) !== Number(id)));
  const save = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = { ...form, id_cliente: Number(form.id_cliente), id_empleado: Number(form.id_empleado), fecha_reservacion: form.fecha_reservacion || null, fecha_entrada: form.fecha_entrada || null, fecha_salida: form.fecha_salida || null };
      if (!selectedRoom) throw new Error('Debe seleccionar una habitación en el mapa del hotel.');
      let reservationId;
      if (editing === 'new') { const result = await api.create('reservaciones', data); reservationId = result.data.id_reservacion; } else { await api.update('reservaciones', editing, data); reservationId = editing; }
      await api.update('reservaciones', `${reservationId}/habitacion`, { id_habitacion: Number(selectedRoom) });
      await api.update('reservaciones', `${reservationId}/servicios`, { services: selectedServices.map(item => ({ id_servicio: Number(item.id_servicio), cantidad: Number(item.cantidad) })) });
      setEditing(null); setEditSummary(null); await load(); setSuccess(editing === 'new' ? 'Reservación creada correctamente.' : 'Reservación actualizada correctamente.');
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const remove = async row => { if (!(await confirm('¿Eliminar esta reservación? Esta acción no se puede deshacer.'))) return; try { await api.remove('reservaciones', row.id_reservacion); await load(); setSuccess('Reservación eliminada correctamente.'); } catch (e) { setError(e.message); } };

  const moveReservation = async (reservationId, mode, sourceDate, targetDate, startDate, endDate) => {
    const row = rows.find(item => Number(item.id_reservacion) === Number(reservationId));
    if (!row || !mode) return;
    let nextEntry = startDate || String(row.fecha_entrada).slice(0, 10);
    let nextExit = endDate || String(row.fecha_salida).slice(0, 10);

    if (mode === 'move') {
      if (sourceDate === targetDate) return;
      const delta = dateDifference(sourceDate, targetDate);
      nextEntry = shiftDate(nextEntry, delta);
      nextExit = shiftDate(nextExit, delta);
    } else if (mode === 'resize-end') {
      if (targetDate === nextExit) return;
      if (targetDate <= nextEntry) {
        setError('La salida debe ser posterior a la entrada.');
        return;
      }
      nextExit = targetDate;
    }

    if (!nextEntry || !nextExit) return;
    setError('');
    try {
      await api.update('reservaciones', reservationId, { fecha_entrada: nextEntry, fecha_salida: nextExit });
      await load();
      setSuccess(mode === 'move'
        ? `Reservación #${reservationId} movida al ${nextEntry.split('-').reverse().join('/')}.`
        : `Estadía de la reservación #${reservationId} actualizada hasta el ${nextExit.split('-').reverse().join('/')}.`);
    } catch (e) { setError(e.message); }
  };
  const openView = async row => { setViewing(row); setViewingSummary(null); const summary = await fetchSummary(row.id_reservacion); setViewingSummary(summary); };

  return <section className="crud-page reservations-page">
    <div className="crud-heading"><div /><div className="crud-heading-actions"><button className="crud-secondary reservation-calendar-button" onClick={() => setCalendarOpen(true)}><CalendarDays size={17}/> Calendario</button><button className="crud-primary" onClick={openNew}><Plus size={17}/> Nueva reservación</button></div></div>
    <div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar reservaciones..."/></div><button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{filtered.length} registros</span></div>
    {error && <div className="crud-error">{error}</div>}{success && <div className="crud-success">{success}</div>}
    <div className="crud-table-wrap">{loading ? <p className="crud-state">Cargando información...</p> : filtered.length === 0 ? <div className="crud-state">No hay reservaciones para mostrar.</div> : <table className="crud-table reservation-table"><thead><tr><th>Reservación</th><th>Cliente</th><th>Empleado</th><th>Fecha de reservación</th><th>Entrada</th><th>Salida</th><th>Estado</th><th>Observaciones</th><th>Acciones</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id_reservacion}><td>#{row.id_reservacion}</td><td>{personName(row.cliente?.persona)}</td><td>{personName(row.empleado?.persona)}</td><td>{dateText(row.fecha_reservacion)}</td><td>{dateText(row.fecha_entrada)}</td><td>{dateText(row.fecha_salida)}</td><td><EnumBadge field="estado" value={row.estado}/></td><td>{row.observaciones || '—'}</td><td><div className="crud-actions"><button onClick={() => openView(row)} title="Ver detalle"><Eye size={16}/></button><button onClick={() => openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={() => remove(row)} title="Eliminar"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>}</div>

    {viewing && <DetailModal title={`Reservación #${viewing.id_reservacion}`} items={[
      { label: 'Cliente', value: personName(viewing.cliente?.persona) }, { label: 'Empleado', value: personName(viewing.empleado?.persona) },
      { label: 'Fecha de reservación', value: dateText(viewing.fecha_reservacion) }, { label: 'Entrada', value: dateText(viewing.fecha_entrada) },
      { label: 'Salida', value: dateText(viewing.fecha_salida) }, { label: 'Estado', value: <EnumBadge field="estado" value={viewing.estado}/> },
      { label: 'Habitación', value: (viewing.detalle_reservacion || []).map(d => `#${d.habitacion?.numero || '—'} · ${money(d.precio_noche)} / noche`).join(' | ') || '—' },
      { label: 'Servicios', value: (viewing.reservacion_servicios || []).map(s => `${s.servicio?.nombre || 'Servicio'} × ${s.cantidad || 1}`).join(' | ') || '—' },
      { label: 'Observaciones', value: viewing.observaciones || '—' },
    ]} onClose={() => { setViewing(null); setViewingSummary(null); }}>
      <ReservationBreakdown summary={viewingSummary}/>
      <div className="reservation-detail-actions"><button className="crud-primary" type="button" onClick={() => { setViewing(null); navigate('/pagos', { state: { id_reservacion: viewing.id_reservacion } }); }}><CreditCard size={16}/> Ir a pagos</button></div>
    </DetailModal>}

    {editing !== null && <div className="crud-modal-backdrop"><form className="crud-modal reservation-edit-modal" onSubmit={save}><div className="crud-modal-head"><h3>{editing === 'new' ? 'Nueva reservación' : 'Editar reservación'}</h3><button type="button" onClick={() => setEditing(null)}><X/></button></div><div className="crud-form-grid">
      <label>Cliente<Select value={form.id_cliente} onChange={e => setForm(v => ({ ...v, id_cliente: e.target.value }))} placeholder="Seleccione cliente" options={clients.map(c => ({ value: c.id_cliente, label: personName(c.persona) }))}/></label>
      <label>Empleado<Select value={form.id_empleado} onChange={e => setForm(v => ({ ...v, id_empleado: e.target.value }))} placeholder="Seleccione empleado" options={employees.map(c => ({ value: c.id_empleado, label: personName(c.persona) }))}/></label>
      <label>Fecha de reservación<DatePicker value={form.fecha_reservacion} onChange={e => setForm(v => ({ ...v, fecha_reservacion: e.target.value }))}/></label>
      <label>Entrada<DatePicker value={form.fecha_entrada} onChange={e => setForm(v => ({ ...v, fecha_entrada: e.target.value }))}/></label>
      <label>Salida<DatePicker value={form.fecha_salida} onChange={e => setForm(v => ({ ...v, fecha_salida: e.target.value }))}/></label>
      <label>Estado<Select value={form.estado} onChange={e => setForm(v => ({ ...v, estado: e.target.value }))} placeholder="Seleccione estado" options={states}/></label>
      <label className="full-field">Observaciones<textarea value={form.observaciones} onChange={e => setForm(v => ({ ...v, observaciones: e.target.value }))}/></label>
    </div>
    <HotelRoomMap
      rooms={roomOptions}
      reservations={rows}
      selectedRoom={selectedRoom}
      onSelect={setSelectedRoom}
      startDate={form.fecha_entrada}
      endDate={form.fecha_salida}
      currentReservationId={editing === 'new' ? null : editing}
    />
    <div className="reservation-services-editor"><div className="reservation-section-title">Servicios adicionales</div><div className="reservation-service-add"><Select value={serviceToAdd} onChange={e => setServiceToAdd(e.target.value)} placeholder="Seleccione servicio" options={services.map(s => ({ value: s.id_servicio, label: `${s.nombre} · ${money(s.precio)}` }))}/><input type="number" min="1" value={serviceQuantity} onChange={e => setServiceQuantity(e.target.value)} aria-label="Cantidad"/><button type="button" className="crud-secondary" onClick={addService}><PlusCircle size={16}/> Agregar</button></div>{selectedServices.length === 0 ? <div className="reservation-services-empty">No hay servicios agregados.</div> : <div className="reservation-services-list">{selectedServices.map(item => <div className="reservation-service-row" key={item.id_servicio}><div><strong>{item.nombre}</strong><small>{item.cantidad} × {money(item.precio)}</small></div><b>{money(item.cantidad * item.precio)}</b><button type="button" onClick={() => removeService(item.id_servicio)} title="Quitar"><Trash2 size={15}/></button></div>)}</div>}</div>
    <ReservationBreakdown summary={previewSummary}/><div className="crud-modal-actions"><button type="button" className="crud-secondary" onClick={() => setEditing(null)}>Cancelar</button><button className="crud-primary" disabled={saving}><Save size={16}/>{saving ? 'Guardando...' : 'Guardar'}</button></div></form></div>}

    {calendarOpen && <ReservationCalendar reservations={rows} onClose={() => setCalendarOpen(false)} onSelect={reservation => { setCalendarOpen(false); openView(reservation); }} onMove={moveReservation}/>} 
  </section>;
}
