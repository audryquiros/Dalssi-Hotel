import { useEffect, useState } from 'react';
import { CalendarDays, Eye, Pencil, Plus, RefreshCw, Search, Trash2, X, Save } from 'lucide-react';
import { api } from '../../services/api.js';
import Select from '../../components/Select/Select.jsx';
import DatePicker from '../../components/DatePicker/DatePicker.jsx';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import EnumBadge from '../../components/EnumBadge/EnumBadge.jsx';
import ReservationCalendar from '../../components/ReservationCalendar/ReservationCalendar.jsx';
import './Reservaciones.css';

const emptyForm = { id_cliente: '', id_empleado: '', fecha_reservacion: '', fecha_entrada: '', fecha_salida: '', estado: 'pendiente', observaciones: '' };
const states = [
  { value: 'pendiente', label: 'Pendiente' }, { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_curso', label: 'En curso' }, { value: 'finalizada', label: 'Finalizada' }, { value: 'cancelada', label: 'Cancelada' },
];
const dateText = value => value ? String(value).slice(0, 10).split('-').reverse().join('/') : '—';
const personName = person => `${person?.nombre || ''} ${person?.apellidos || ''}`.trim() || '—';

export default function Reservaciones() {
  const [rows, setRows] = useState([]), [clients, setClients] = useState([]), [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [success, setSuccess] = useState(''), [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null), [viewing, setViewing] = useState(null), [calendarOpen, setCalendarOpen] = useState(false), [form, setForm] = useState(emptyForm), [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); setError(''); try { const result = await api.list('reservaciones'); setRows(result.data || []); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  const loadRelations = async () => { try { const [c, e] = await Promise.all([api.list('clientes'), api.list('empleados')]); setClients((c.data || []).filter(row => row.estado !== 'inactivo' && row.persona?.estado !== 'inactivo')); setEmployees((e.data || []).filter(row => row.estado !== 'inactivo' && row.persona?.estado !== 'inactivo')); } catch (e) { setError(e.message); } };
  useEffect(() => { load(); loadRelations(); }, []);
  useEffect(() => { if (!success) return; const timer = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(timer); }, [success]);

  const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const openNew = () => { setForm(emptyForm); setEditing('new'); setError(''); };
  const openEdit = row => { setForm({ id_cliente: row.id_cliente || '', id_empleado: row.id_empleado || '', fecha_reservacion: String(row.fecha_reservacion || '').slice(0, 10), fecha_entrada: String(row.fecha_entrada || '').slice(0, 10), fecha_salida: String(row.fecha_salida || '').slice(0, 10), estado: row.estado || 'pendiente', observaciones: row.observaciones || '' }); setEditing(row.id_reservacion); setError(''); };
  const save = async e => { e.preventDefault(); setSaving(true); setError(''); try { const data = { ...form, id_cliente: Number(form.id_cliente), id_empleado: Number(form.id_empleado), fecha_reservacion: form.fecha_reservacion || null, fecha_entrada: form.fecha_entrada || null, fecha_salida: form.fecha_salida || null }; if (editing === 'new') await api.create('reservaciones', data); else await api.update('reservaciones', editing, data); setEditing(null); await load(); setSuccess(editing === 'new' ? 'Reservación creada correctamente.' : 'Reservación actualizada correctamente.'); } catch (e) { setError(e.message); } finally { setSaving(false); } };
  const remove = async row => { if (!confirm('¿Eliminar esta reservación? Esta acción no se puede deshacer.')) return; try { await api.remove('reservaciones', row.id_reservacion); await load(); setSuccess('Reservación eliminada correctamente.'); } catch (e) { setError(e.message); } };

  return <section className="crud-page reservations-page">
    <div className="crud-heading"><div /><div className="crud-heading-actions"><button className="crud-secondary reservation-calendar-button" onClick={() => setCalendarOpen(true)}><CalendarDays size={17}/> Calendario</button><button className="crud-primary" onClick={openNew}><Plus size={17}/> Nueva reservación</button></div></div>
    <div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar reservaciones..."/></div><button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{filtered.length} registros</span></div>
    {error && <div className="crud-error">{error}</div>}{success && <div className="crud-success">{success}</div>}
    <div className="crud-table-wrap">{loading ? <p className="crud-state">Cargando información...</p> : filtered.length === 0 ? <div className="crud-state">No hay reservaciones para mostrar.</div> : <table className="crud-table reservation-table"><thead><tr><th>Reservación</th><th>Cliente</th><th>Empleado</th><th>Fecha de reservación</th><th>Entrada</th><th>Salida</th><th>Estado</th><th>Observaciones</th><th>Acciones</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id_reservacion}><td>#{row.id_reservacion}</td><td>{personName(row.cliente?.persona)}</td><td>{personName(row.empleado?.persona)}</td><td>{dateText(row.fecha_reservacion)}</td><td>{dateText(row.fecha_entrada)}</td><td>{dateText(row.fecha_salida)}</td><td><EnumBadge field="estado" value={row.estado}/></td><td>{row.observaciones || '—'}</td><td><div className="crud-actions"><button onClick={() => setViewing(row)} title="Ver detalle"><Eye size={16}/></button><button onClick={() => openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={() => remove(row)} title="Eliminar"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>}</div>

    {viewing && <DetailModal title={`Reservación #${viewing.id_reservacion}`} items={[
      { label: 'Cliente', value: personName(viewing.cliente?.persona) }, { label: 'Empleado', value: personName(viewing.empleado?.persona) },
      { label: 'Fecha de reservación', value: dateText(viewing.fecha_reservacion) }, { label: 'Entrada', value: dateText(viewing.fecha_entrada) },
      { label: 'Salida', value: dateText(viewing.fecha_salida) }, { label: 'Estado', value: <EnumBadge field="estado" value={viewing.estado}/> },
      { label: 'Habitación', value: (viewing.detalle_reservacion || []).map(d => `#${d.habitacion?.numero || '—'} · ₡${Number(d.precio_noche || 0).toLocaleString('es-CR')} / noche`).join(' | ') || '—' },
      { label: 'Servicios', value: (viewing.reservacion_servicios || []).map(s => `${s.servicio?.nombre || 'Servicio'} × ${s.cantidad || 1}`).join(' | ') || '—' },
      { label: 'Observaciones', value: viewing.observaciones || '—' },
    ]} onClose={() => setViewing(null)}/>} 

    {editing !== null && <div className="crud-modal-backdrop"><form className="crud-modal" onSubmit={save}><div className="crud-modal-head"><h3>{editing === 'new' ? 'Nueva reservación' : 'Editar reservación'}</h3><button type="button" onClick={() => setEditing(null)}><X/></button></div><div className="crud-form-grid">
      <label>Cliente<Select value={form.id_cliente} onChange={e => setForm(v => ({ ...v, id_cliente: e.target.value }))} placeholder="Seleccione cliente" options={clients.map(c => ({ value: c.id_cliente, label: personName(c.persona) }))}/></label>
      <label>Empleado<Select value={form.id_empleado} onChange={e => setForm(v => ({ ...v, id_empleado: e.target.value }))} placeholder="Seleccione empleado" options={employees.map(c => ({ value: c.id_empleado, label: personName(c.persona) }))}/></label>
      <label>Fecha de reservación<DatePicker value={form.fecha_reservacion} onChange={e => setForm(v => ({ ...v, fecha_reservacion: e.target.value }))}/></label>
      <label>Entrada<DatePicker value={form.fecha_entrada} onChange={e => setForm(v => ({ ...v, fecha_entrada: e.target.value }))}/></label>
      <label>Salida<DatePicker value={form.fecha_salida} onChange={e => setForm(v => ({ ...v, fecha_salida: e.target.value }))}/></label>
      <label>Estado<Select value={form.estado} onChange={e => setForm(v => ({ ...v, estado: e.target.value }))} placeholder="Seleccione estado" options={states}/></label>
      <label className="full-field">Observaciones<textarea value={form.observaciones} onChange={e => setForm(v => ({ ...v, observaciones: e.target.value }))}/></label>
    </div><div className="crud-modal-actions"><button type="button" className="crud-secondary" onClick={() => setEditing(null)}>Cancelar</button><button className="crud-primary" disabled={saving}><Save size={16}/>{saving ? 'Guardando...' : 'Guardar'}</button></div></form></div>}

    {calendarOpen && <ReservationCalendar reservations={rows} onClose={() => setCalendarOpen(false)} onSelect={reservation => { setCalendarOpen(false); setViewing(reservation); }}/>} 
  </section>;
}
