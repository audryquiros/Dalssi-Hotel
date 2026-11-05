import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw, X, Save, Eye, CalendarDays } from 'lucide-react';
import { api } from '../../services/api.js';
import DetailModal from '../DetailModal/DetailModal.jsx';
import Select from '../Select/Select.jsx';
import DatePicker from '../DatePicker/DatePicker.jsx';
import EnumBadge from '../EnumBadge/EnumBadge.jsx';
import ReservationCalendar from '../ReservationCalendar/ReservationCalendar.jsx';
import './CrudPage.css';

const labels = { id_persona:'ID persona', identificacion:'Identificación', nombre:'Nombre', apellidos:'Apellidos', telefono:'Teléfono', correo:'Correo', direccion:'Dirección', fecha_registro:'Fecha de registro', id_pais:'País', id_cliente:'ID cliente', id_empleado:'Empleado', fecha_reservacion:'Fecha de reservación', fecha_entrada:'Entrada', fecha_salida:'Salida', estado:'Estado', numero:'Número', piso:'Piso', ubicacion:'Ubicación', id_tipo_habitacion:'Tipo de habitación', id_huesped:'ID huésped', id_reservacion:'Reservación', monto:'Monto', metodo_pago:'Método de pago', fecha_pago:'Fecha de pago', numero_factura:'Número de factura', total:'Total', precio:'Precio', descripcion:'Descripción', puesto:'Puesto', fecha_contratacion:'Contratación' };
const excluded = key => key.startsWith('id_') && key !== 'id_persona' && !['id_cliente','id_empleado','id_huesped','id_reservacion','id_tipo_habitacion','id_pais'].includes(key);

const enumOptions = {
  'empleados.estado': [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }],
  'habitaciones.estado': [{ value: 'disponible', label: 'Disponible' }, { value: 'ocupada', label: 'Ocupada' }, { value: 'mantenimiento', label: 'Mantenimiento' }, { value: 'limpieza', label: 'Limpieza' }],
  'reservaciones.estado': [{ value: 'pendiente', label: 'Pendiente' }, { value: 'confirmada', label: 'Confirmada' }, { value: 'en_curso', label: 'En curso' }, { value: 'finalizada', label: 'Finalizada' }, { value: 'cancelada', label: 'Cancelada' }],
  'servicios.estado': [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }],
  'categorias_servicios.estado': [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }],
  'pagos.metodo_pago': [{ value: 'sinpe', label: 'SINPE' }, { value: 'transferencia', label: 'Transferencia' }, { value: 'tarjeta', label: 'Tarjeta' }, { value: 'efectivo', label: 'Efectivo' }],
  'pagos.estado': [{ value: 'pendiente', label: 'Pendiente' }, { value: 'confirmado', label: 'Confirmado' }, { value: 'rechazado', label: 'Rechazado' }, { value: 'anulado', label: 'Anulado' }],
  'facturas.estado': [{ value: 'emitida', label: 'Emitida' }, { value: 'anulada', label: 'Anulada' }],
};

const isDateField = key => key.startsWith('fecha_') || key === 'fecha_entrada' || key === 'fecha_salida';
const moneyFields = new Set(['monto','precio','precio_unitario','subtotal','impuestos','total']);
const formatMoney = value => `₡${Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = value => { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value).slice(0,10) : date.toLocaleDateString('es-CR'); };
const displayValue = (table, key, value) => {
  if (value === null || value === '') return '—';
  if (enumOptions[`${table}.${key}`]) return <EnumBadge value={value} />;
  if (moneyFields.has(key)) return formatMoney(value);
  if (isDateField(key)) return formatDate(value);
  if (key.startsWith('id_') && key !== 'id_persona') return `#${value}`;
  return String(value);
};
const actionLabels = { clientes: 'Nuevo cliente', huespedes: 'Nuevo huésped', empleados: 'Nuevo empleado', habitaciones: 'Nueva habitación', reservaciones: 'Nueva reservación', servicios: 'Nuevo servicio', pagos: 'Nuevo pago', facturas: 'Nueva factura', categorias_servicios: 'Nueva categoría', tipos_habitacion: 'Nuevo tipo', paises: 'Nuevo país', personas: 'Nueva persona' };

export default function CrudPage({ table, title, calendarEnabled = false }) {
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState(''),[editing,setEditing]=useState(null),[form,setForm]=useState({}),[saving,setSaving]=useState(false),[viewing,setViewing]=useState(null),[calendarOpen,setCalendarOpen]=useState(false);
 const load=async()=>{setLoading(true);setError('');try{const result=await api.list(table);setRows(result.data||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
 useEffect(()=>{load();},[table]);
 const columns=useMemo(()=>rows[0]?Object.keys(rows[0]).filter(k=>!excluded(k)||k==='id_persona'):[],[rows]);
 const filtered=rows.filter(row=>JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
 const openNew=()=>{setEditing('new');setForm({});}; const openEdit=row=>{setEditing(row[Object.keys(row).find(k=>k.startsWith('id_'))]);setForm({...row});};
 const save=async e=>{e.preventDefault();setSaving(true);try{const idKey=Object.keys(form).find(k=>k.startsWith('id_') && k===`id_${table.replace(/s$/,'')}`);const data={...form};Object.keys(data).filter(k=>k.startsWith('id_')&&(!data[k]||k===idKey)).forEach(k=>delete data[k]);if(editing==='new')await api.create(table,data);else {const primary=columns.find(k=>k.startsWith('id_'));await api.update(table,editing,Object.fromEntries(Object.entries(data).filter(([k])=>k!==primary)));}setEditing(null);await load();}catch(e){setError(e.message);}finally{setSaving(false);}};
 const remove=async row=>{const primary=Object.keys(row).find(k=>k.startsWith('id_'));if(!primary||!confirm('¿Eliminar este registro?'))return;try{await api.remove(table,row[primary]);await load();}catch(e){setError(e.message);}};
 const editableKeys=rows[0]?Object.keys(rows[0]).filter(k=>!k.startsWith('id_')||k==='id_persona'):[];
 return <section className="crud-page">
 <div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Buscar ${title.toLowerCase()}...`}/></div><button className="crud-primary crud-toolbar-primary" onClick={openNew}><Plus size={17}/> {actionLabels[table] || `Nuevo ${title.toLowerCase()}`}</button>{calendarEnabled&&<button className="crud-icon-btn crud-calendar-btn" onClick={()=>setCalendarOpen(true)} title="Ver calendario"><CalendarDays size={17}/> <span>Calendario</span></button>}<button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{rows.length} registros</span></div>
 {error&&<div className="crud-error">{error}</div>}
 <div className="crud-table-wrap">{loading?<p className="crud-state">Cargando información...</p>:rows.length===0?<div className="crud-state">{error?'No se pudo cargar la información.':'Todavía no hay registros. Podés crear el primero.'}</div>:<table className="crud-table"><thead><tr>{columns.map(k=><th key={k}>{labels[k]||k.replaceAll('_',' ')}</th>)}<th>Acciones</th></tr></thead><tbody>{filtered.map((row,i)=><tr key={i}>{columns.map(k=><td key={k}>{displayValue(table, k, row[k])}</td>)}<td><div className="crud-actions"><button onClick={()=>setViewing(row)} title="Ver detalle"><Eye size={16}/></button><button onClick={()=>openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={()=>remove(row)} title="Eliminar"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>}</div>
 {viewing&&<DetailModal title={`${title} · detalle`} items={columns.map(k=>({label:labels[k]||k.replaceAll('_',' '),value:viewing[k]}))} onClose={()=>setViewing(null)}/>} {calendarOpen&&<ReservationCalendar reservations={rows} onClose={()=>setCalendarOpen(false)} onSelect={row=>{setCalendarOpen(false);setViewing(row)}}/>} {editing!==null&&<div className="crud-modal-backdrop"><form className="crud-modal" onSubmit={save}><div className="crud-modal-head"><h3>{editing==='new'?(actionLabels[table] || `Nuevo ${title.toLowerCase()}`):`Editar ${title.toLowerCase()}`}</h3><button type="button" onClick={()=>setEditing(null)}><X/></button></div><div className="crud-form-grid">{(editableKeys.length?editableKeys:Object.keys(form)).filter(k=>!k.startsWith('id_')).map(k=>{
          const options = enumOptions[`${table}.${k}`];
          return <label key={k}>{labels[k]||k.replaceAll('_',' ')}{options ? <Select value={form[k]??''} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} placeholder={`Seleccione ${labels[k]?.toLowerCase()||k.replaceAll('_',' ')}`} options={options} /> : isDateField(k) ? <DatePicker value={form[k]??''} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} /> : <input type={k==='monto'||k==='precio'||k==='subtotal'||k==='impuestos'||k==='total'?'number':'text'} step={k==='monto'||k==='precio'||k==='subtotal'||k==='impuestos'||k==='total'?'0.01':undefined} value={form[k]??''} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} placeholder={labels[k]||k} />}</label>;
        })}</div><div className="crud-modal-actions"><button type="button" className="crud-secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="crud-primary" disabled={saving}><Save size={16}/>{saving?'Guardando...':'Guardar'}</button></div></form></div>}
 </section>;
}
