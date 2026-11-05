import { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus, ReceiptText, Trash2, X, Save, Search } from 'lucide-react';
import { api } from '../../services/api.js';
import Select from '../../components/Select/Select.jsx';
import DatePicker from '../../components/DatePicker/DatePicker.jsx';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import './Facturas.css';

const TAX_OPTIONS = [
  { value: '13', label: 'IVA 13%' },
  { value: '0', label: 'Exento (0%)' },
];
const STATUS_OPTIONS = [
  { value: 'emitida', label: 'Emitida' },
  { value: 'anulada', label: 'Anulada' },
];
const money = value => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 2 }).format(Number(value || 0));
const round = value => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

export default function Facturas() {
  const [rows, setRows] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id_reservacion: '', numero_factura: '', fecha_emision: '', porcentaje_impuesto: '13', estado: 'emitida', detalles: [{ descripcion: '', cantidad: 1, precio_unitario: '' }] });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [invoiceResult, reservationResult] = await Promise.all([api.list('facturas'), api.list('reservaciones')]);
      setRows(invoiceResult.data || []);
      setReservaciones(reservationResult.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const reservationOptions = useMemo(() => reservaciones.map(item => ({ value: item.id_reservacion, label: `Reservación #${item.id_reservacion} · ${String(item.fecha_entrada || '').slice(0, 10)} → ${String(item.fecha_salida || '').slice(0, 10)}` })), [reservaciones]);
  const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const subtotal = round(form.detalles.reduce((sum, item) => sum + Number(item.cantidad || 0) * Number(item.precio_unitario || 0), 0));
  const taxRate = Number(form.porcentaje_impuesto || 0);
  const tax = round(subtotal * taxRate / 100);
  const total = round(subtotal + tax);

  const resetForm = () => setForm({ id_reservacion: '', numero_factura: '', fecha_emision: '', porcentaje_impuesto: '13', estado: 'emitida', detalles: [{ descripcion: '', cantidad: 1, precio_unitario: '' }] });
  const openNew = () => { resetForm(); setEditing('new'); };
  const openEdit = async row => {
    try {
      const result = await api.get('facturas', row.id_factura);
      const data = result.data;
      setForm({ id_reservacion: String(data.id_reservacion || ''), numero_factura: data.numero_factura || '', fecha_emision: String(data.fecha_emision || '').slice(0, 10), porcentaje_impuesto: String(data.porcentaje_impuesto ?? 13), estado: data.estado || 'emitida', detalles: data.detalle_factura?.length ? data.detalle_factura.map(d => ({ descripcion: d.descripcion || '', cantidad: d.cantidad || 1, precio_unitario: d.precio_unitario || '' })) : [{ descripcion: '', cantidad: 1, precio_unitario: data.subtotal || '' }] });
      setEditing(row.id_factura);
    } catch (e) { setError(e.message); }
  };
  const updateDetail = (index, key, value) => setForm(current => ({ ...current, detalles: current.detalles.map((detail, i) => i === index ? { ...detail, [key]: value } : detail) }));
  const addDetail = () => setForm(current => ({ ...current, detalles: [...current.detalles, { descripcion: '', cantidad: 1, precio_unitario: '' }] }));
  const removeDetail = index => setForm(current => ({ ...current, detalles: current.detalles.length === 1 ? current.detalles : current.detalles.filter((_, i) => i !== index) }));

  const save = async event => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, id_reservacion: Number(form.id_reservacion), porcentaje_impuesto: Number(form.porcentaje_impuesto), detalles: form.detalles.filter(item => item.descripcion.trim() || Number(item.precio_unitario) > 0).map(item => ({ ...item, cantidad: Number(item.cantidad), precio_unitario: Number(item.precio_unitario) })) };
      if (editing === 'new') await api.create('facturas', payload); else await api.update('facturas', editing, payload);
      setEditing(null); await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  const remove = async row => { if (!confirm(`¿Eliminar la factura ${row.numero_factura || `#${row.id_factura}`}?`)) return; try { await api.remove('facturas', row.id_factura); await load(); } catch (e) { setError(e.message); } };

  return <section className="facturas-page">
    <div className="facturas-heading"><div><p>Emisión, impuestos y control de facturación del hotel.</p></div><button className="facturas-primary" onClick={openNew}><Plus size={17}/> Nueva factura</button></div>
    <div className="facturas-toolbar"><div className="facturas-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar facturas..." /></div><span>{rows.length} registros</span></div>
    {error && <div className="facturas-error">{error}</div>}
    <div className="facturas-table-wrap">{loading ? <div className="facturas-state">Cargando facturas...</div> : filtered.length === 0 ? <div className="facturas-state">No hay facturas para mostrar.</div> : <table className="facturas-table"><thead><tr><th>Número</th><th>Reservación</th><th>Emisión</th><th>Subtotal</th><th>Impuesto</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id_factura}><td>{row.numero_factura || `#${row.id_factura}`}</td><td>#{row.id_reservacion}</td><td>{String(row.fecha_emision || '').slice(0, 10) || '—'}</td><td>{money(row.subtotal)}</td><td>{money(row.impuestos)} <small>{Number(row.porcentaje_impuesto || 0)}%</small></td><td className="facturas-total">{money(row.total)}</td><td><span className={`factura-status ${row.estado}`}>{row.estado === 'emitida' ? 'Emitida' : 'Anulada'}</span></td><td><div className="facturas-actions"><button onClick={() => setViewing(row)} title="Ver detalle"><Eye size={16}/></button><button onClick={() => openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={() => remove(row)} title="Eliminar"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>}</div>

    {viewing && <DetailModal title={`Factura ${viewing.numero_factura || `#${viewing.id_factura}`}`} items={[{ label: 'Reservación', value: `#${viewing.id_reservacion}` }, { label: 'Fecha de emisión', value: String(viewing.fecha_emision || '').slice(0, 10) }, { label: 'Subtotal', value: money(viewing.subtotal) }, { label: 'Tasa de impuesto', value: `${Number(viewing.porcentaje_impuesto || 0)}%` }, { label: 'Impuesto', value: money(viewing.impuestos) }, { label: 'Total', value: money(viewing.total) }, { label: 'Estado', value: viewing.estado === 'emitida' ? 'Emitida' : 'Anulada' }]} onClose={() => setViewing(null)} />}

    {editing !== null && <div className="facturas-modal-backdrop"><form className="facturas-modal" onSubmit={save}><div className="facturas-modal-head"><div><span>FACTURACIÓN</span><h3>{editing === 'new' ? 'Nueva factura' : 'Editar factura'}</h3></div><button type="button" onClick={() => setEditing(null)}><X size={20}/></button></div>
      <div className="facturas-form-grid">
        <label>Reservación<Select value={form.id_reservacion} onChange={e => setForm(v => ({ ...v, id_reservacion: e.target.value }))} placeholder="Seleccione una reservación" options={reservationOptions}/></label>
        <label>Número de factura<input value={form.numero_factura} onChange={e => setForm(v => ({ ...v, numero_factura: e.target.value }))} placeholder="Ej. FAC-2026-0001" /></label>
        <label>Fecha de emisión<DatePicker value={form.fecha_emision} onChange={e => setForm(v => ({ ...v, fecha_emision: e.target.value }))}/></label>
        <label>Estado<Select value={form.estado} onChange={e => setForm(v => ({ ...v, estado: e.target.value }))} options={STATUS_OPTIONS}/></label>
      </div>
      <div className="facturas-details-head"><div><span>Detalle de la factura</span><p>El subtotal se calcula automáticamente a partir de las líneas.</p></div><button type="button" className="facturas-add-line" onClick={addDetail}><Plus size={15}/> Agregar línea</button></div>
      <div className="facturas-lines">{form.detalles.map((detail, index) => <div className="factura-line" key={index}><input className="line-description" value={detail.descripcion} onChange={e => updateDetail(index, 'descripcion', e.target.value)} placeholder="Descripción del servicio" /><input className="line-qty" type="number" min="1" value={detail.cantidad} onChange={e => updateDetail(index, 'cantidad', e.target.value)} /><input className="line-price" type="number" min="0" step="0.01" value={detail.precio_unitario} onChange={e => updateDetail(index, 'precio_unitario', e.target.value)} placeholder="Precio" /><div className="line-subtotal">{money(Number(detail.cantidad || 0) * Number(detail.precio_unitario || 0))}</div><button type="button" className="line-remove" onClick={() => removeDetail(index)} disabled={form.detalles.length === 1}><X size={15}/></button></div>)}</div>
      <div className="facturas-summary"><div className="tax-selector"><label>Tasa de impuesto<Select value={form.porcentaje_impuesto} onChange={e => setForm(v => ({ ...v, porcentaje_impuesto: e.target.value }))} options={TAX_OPTIONS}/></label><p>El backend recalcula este valor al guardar la factura.</p></div><div className="facturas-totals"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Impuesto ({taxRate}%)</span><strong>{money(tax)}</strong></div><div className="grand"><span>Total</span><strong>{money(total)}</strong></div></div></div>
      <div className="facturas-modal-actions"><button type="button" className="facturas-secondary" onClick={() => setEditing(null)}>Cancelar</button><button className="facturas-primary" disabled={saving}><Save size={16}/>{saving ? 'Guardando...' : 'Guardar factura'}</button></div>
    </form></div>}
  </section>;
}
