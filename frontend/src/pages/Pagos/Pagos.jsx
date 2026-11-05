import { useEffect, useState } from 'react';
import { ArrowRight, Eye, Pencil, Plus, RefreshCw, Search, Trash2, X, Save, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import Select from '../../components/Select/Select.jsx';
import DatePicker from '../../components/DatePicker/DatePicker.jsx';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import EnumBadge from '../../components/EnumBadge/EnumBadge.jsx';
import './Pagos.css';

const emptyForm = { id_reservacion:'', fecha_pago:'', metodo_pago:'', estado:'confirmado' };
const methods = [{value:'sinpe',label:'SINPE'},{value:'transferencia',label:'Transferencia'},{value:'tarjeta',label:'Tarjeta'},{value:'efectivo',label:'Efectivo'}];
const states = [{value:'pendiente',label:'Pendiente'},{value:'confirmado',label:'Confirmado'},{value:'rechazado',label:'Rechazado'},{value:'anulado',label:'Anulado'}];
const dateText = value => value ? String(value).slice(0,10).split('-').reverse().join('/') : '—';
const money = value => `₡${Number(value || 0).toLocaleString('es-CR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const clientName = row => {
  const person = row?.reservacion?.cliente?.persona;
  if (person) return `${person.nombre || ''} ${person.apellidos || ''}`.trim() || `Cliente #${row?.reservacion?.id_cliente || row?.id_cliente || '—'}`;
  return row?.cliente_nombre || `Cliente #${row?.reservacion?.id_cliente || row?.id_cliente || '—'}`;
};
const reservationLabel = row => `#${row.id_reservacion} · ${row.cliente_nombre || 'Cliente'} · ${dateText(row.fecha_entrada)}`;

function Breakdown({ summary }) {
  if (!summary) return <div className="payment-summary-empty">Seleccioná una reservación para calcular automáticamente el monto.</div>;
  return <div className="payment-summary"><div className="payment-summary-title">Desglose de la reservación</div><div className="payment-lines">
    {summary.rooms.map(item => <div className="payment-line" key={`room-${item.id_detalle_reservacion}`}><span>{item.descripcion} <small>{item.cantidad} noche(s)</small></span><strong>{money(item.subtotal)}</strong></div>)}
    {summary.services.map(item => <div className="payment-line" key={`service-${item.id_reservacion_servicio}`}><span>{item.descripcion} <small>{item.cantidad} × {money(item.precio_unitario)}</small></span><strong>{money(item.subtotal)}</strong></div>)}
  </div><div className="payment-totals"><span>Subtotal</span><strong>{money(summary.subtotal)}</strong><span>Impuesto (13%)</span><strong>{money(summary.impuestos)}</strong><span className="grand">Total a pagar</span><strong className="grand">{money(summary.total)}</strong></div></div>;
}

export default function Pagos() {
  const navigate = useNavigate();
  const [rows,setRows]=useState([]),[reservations,setReservations]=useState([]),[summary,setSummary]=useState(null);
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[success,setSuccess]=useState(''),[query,setQuery]=useState('');
  const [editing,setEditing]=useState(null),[viewing,setViewing]=useState(null),[form,setForm]=useState(emptyForm),[saving,setSaving]=useState(false);

  const load=async()=>{setLoading(true);setError('');try{const result=await api.list('pagos');setRows(result.data||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
  const loadReservations=async()=>{try{const result=await api.list('pagos/reservaciones-disponibles');setReservations(result.data||[]);}catch(e){setError(e.message);}};
  useEffect(()=>{load();loadReservations();},[]);
  useEffect(()=>{if(!success)return;const timer=setTimeout(()=>setSuccess(''),3000);return()=>clearTimeout(timer);},[success]);
  const filtered=rows.filter(row=>JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const fetchSummary=async id=>{if(!id){setSummary(null);return;}try{const result=await api.get('pagos/reservaciones',`${id}/resumen`);setSummary(result.data);}catch(e){setError(e.message);setSummary(null);}};
  const openNew=()=>{setEditing('new');setForm({...emptyForm});setSummary(null);setError('');};
  const openEdit=async row=>{setEditing(row.id_pago);setForm({id_reservacion:row.id_reservacion,fecha_pago:String(row.fecha_pago||'').slice(0,10),metodo_pago:row.metodo_pago||'',estado:row.estado||'pendiente'});await fetchSummary(row.id_reservacion);setError('');};
  const save=async e=>{e.preventDefault();if(!form.id_reservacion||!form.metodo_pago||!form.estado){setError('Completá los campos obligatorios.');return;}if(!summary){setError('No se pudo calcular el total de la reservación.');return;}setSaving(true);setError('');try{const data={id_reservacion:Number(form.id_reservacion),fecha_pago:form.fecha_pago||null,monto:summary.total,metodo_pago:form.metodo_pago,estado:form.estado};if(editing==='new')await api.create('pagos',data);else await api.update('pagos',editing,data);setEditing(null);setSummary(null);await load();await loadReservations();setSuccess(editing==='new'?'Pago registrado correctamente.':'Pago actualizado correctamente.');}catch(e){setError(e.message);}finally{setSaving(false);}};
  const remove=async row=>{if(!confirm('¿Eliminar este pago? Esta acción no se puede deshacer.'))return;try{await api.remove('pagos',row.id_pago);await load();await loadReservations();setSuccess('Pago eliminado correctamente.');}catch(e){setError(e.message);}};
  const emitInvoice=async row=>{if(row.estado!=='confirmado'){setError('El pago debe estar confirmado para emitir la factura.');return;}try{await api.create('facturas',{id_reservacion:row.id_reservacion});setSuccess('Factura emitida correctamente.');await load();navigate('/facturas');}catch(e){setError(e.message);}};

  return <section className="crud-page payments-page">
    <div className="crud-heading"><div/><button className="crud-primary" onClick={openNew}><Plus size={17}/> Nuevo pago</button></div>
    <div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar pagos..."/></div><button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{filtered.length} registros</span></div>
    {error&&<div className="crud-error">{error}</div>}{success&&<div className="crud-success">{success}</div>}
    <div className="crud-table-wrap">{loading?<p className="crud-state">Cargando información...</p>:filtered.length===0?<div className="crud-state">No hay pagos para mostrar.</div>:<table className="crud-table payments-table"><thead><tr><th>Pago</th><th>Reservación</th><th>Cliente</th><th>Fecha de pago</th><th>Monto</th><th>Método de pago</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtered.map(row=><tr key={row.id_pago}><td>#{row.id_pago}</td><td>#{row.id_reservacion} · {dateText(row.reservacion?.fecha_entrada)}</td><td>{clientName(row)}</td><td>{dateText(row.fecha_pago)}</td><td>{money(row.monto)}</td><td><EnumBadge field="metodo_pago" value={row.metodo_pago}/></td><td><EnumBadge field="estado" value={row.estado}/></td><td><div className="crud-actions"><button onClick={()=>setViewing(row)} title="Ver detalle"><Eye size={16}/></button><button onClick={()=>openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={()=>remove(row)} title="Eliminar"><Trash2 size={16}/></button>{row.facturable&&<button className="invoice-action" onClick={()=>emitInvoice(row)} title="Emitir factura"><FileText size={16}/></button>}</div></td></tr>)}</tbody></table>}</div>

    {viewing&&<DetailModal title={`Pago #${viewing.id_pago}`} items={[{label:'Reservación',value:`#${viewing.id_reservacion}`},{label:'Cliente',value:clientName(viewing)},{label:'Fecha de pago',value:dateText(viewing.fecha_pago)},{label:'Monto',value:money(viewing.monto)},{label:'Método de pago',value:<EnumBadge field="metodo_pago" value={viewing.metodo_pago}/>},{label:'Estado',value:<EnumBadge field="estado" value={viewing.estado}/>}]} onClose={()=>setViewing(null)}>{viewing.desglose&&<Breakdown summary={viewing.desglose}/>}</DetailModal>}

    {editing!==null&&<div className="crud-modal-backdrop"><form className="crud-modal payment-modal" onSubmit={save}><div className="crud-modal-head"><h3>{editing==='new'?'Nuevo pago':'Editar pago'}</h3><button type="button" onClick={()=>{setEditing(null);setSummary(null)}}><X/></button></div><div className="crud-form-grid">
      <label>Reservación<Select value={form.id_reservacion} onChange={e=>{setForm(v=>({...v,id_reservacion:e.target.value}));fetchSummary(e.target.value)}} placeholder="Seleccione reservación" options={(editing==='new'?reservations:reservations.concat(form.id_reservacion?rows.filter(r=>r.id_pago===editing).map(r=>({id_reservacion:r.id_reservacion,cliente_nombre:clientName(r),fecha_entrada:r.reservacion?.fecha_entrada})) : [])).filter((row,i,arr)=>arr.findIndex(x=>String(x.id_reservacion)===String(row.id_reservacion))===i).map(reservation=>({value:reservation.id_reservacion,label:reservationLabel(reservation)}))}/></label>
      <label>Fecha de pago<DatePicker value={form.fecha_pago} onChange={e=>setForm(v=>({...v,fecha_pago:e.target.value}))}/></label>
      <label>Método de pago<Select value={form.metodo_pago} onChange={e=>setForm(v=>({...v,metodo_pago:e.target.value}))} placeholder="Seleccione método de pago" options={methods}/></label>
      <label>Estado<Select value={form.estado} onChange={e=>setForm(v=>({...v,estado:e.target.value}))} placeholder="Seleccione estado" options={states}/></label>
      <label>Monto a pagar<input value={summary ? money(summary.total) : '—'} readOnly /></label>
    </div><Breakdown summary={summary}/><div className="crud-modal-actions"><button type="button" className="crud-secondary" onClick={()=>{setEditing(null);setSummary(null)}}>Cancelar</button><button className="crud-primary" disabled={saving}><Save size={16}/>{saving?'Guardando...':'Guardar pago'}</button></div></form></div>}
  </section>;
}
