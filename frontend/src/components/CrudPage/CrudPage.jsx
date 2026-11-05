import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw, X, Save, Eye, Printer } from 'lucide-react';
import { api } from '../../services/api.js';
import DetailModal from '../DetailModal/DetailModal.jsx';
import Select from '../Select/Select.jsx';
import DatePicker from '../DatePicker/DatePicker.jsx';
import EnumBadge from '../EnumBadge/EnumBadge.jsx';
import './CrudPage.css';

const labels = {
  id_persona:'ID persona', identificacion:'Identificación', nombre:'Nombre', apellidos:'Apellidos', telefono:'Teléfono', correo:'Correo', direccion:'Dirección', fecha_registro:'Fecha de registro', id_pais:'País', id_cliente:'Cliente', id_empleado:'Empleado', fecha_reservacion:'Fecha de reservación', fecha_entrada:'Entrada', fecha_salida:'Salida', estado:'Estado', numero:'Número', piso:'Piso', ubicacion:'Ubicación', id_tipo_habitacion:'Tipo de habitación', id_huesped:'Huésped', id_reservacion:'Reservación', monto:'Monto', metodo_pago:'Método de pago', fecha_pago:'Fecha de pago', numero_factura:'Número de factura', fecha_emision:'Fecha de emisión', subtotal:'Subtotal', impuestos:'Impuesto', porcentaje_impuesto:'Tasa de impuesto', total:'Total', cliente_nombre:'Cliente', precio:'Precio', descripcion:'Descripción', puesto:'Puesto', fecha_contratacion:'Contratación'
};

const excluded = key => key.startsWith('id_') && key !== 'id_persona' && !['id_cliente','id_empleado','id_huesped','id_reservacion','id_tipo_habitacion','id_pais','id_categoria_servicio'].includes(key);

const enumOptions = {
  'empleados.estado': [{ value:'activo', label:'Activo' }, { value:'inactivo', label:'Inactivo' }],
  'habitaciones.estado': [{ value:'disponible', label:'Disponible' }, { value:'ocupada', label:'Ocupada' }, { value:'mantenimiento', label:'Mantenimiento' }, { value:'limpieza', label:'Limpieza' }],
  'reservaciones.estado': [{ value:'pendiente', label:'Pendiente' }, { value:'confirmada', label:'Confirmada' }, { value:'en_curso', label:'En curso' }, { value:'finalizada', label:'Finalizada' }, { value:'cancelada', label:'Cancelada' }],
  'servicios.estado': [{ value:'activo', label:'Activo' }, { value:'inactivo', label:'Inactivo' }],
  'categorias_servicios.estado': [{ value:'activo', label:'Activo' }, { value:'inactivo', label:'Inactivo' }],
  'pagos.metodo_pago': [{ value:'sinpe', label:'SINPE' }, { value:'transferencia', label:'Transferencia' }, { value:'tarjeta', label:'Tarjeta' }, { value:'efectivo', label:'Efectivo' }],
  'pagos.estado': [{ value:'pendiente', label:'Pendiente' }, { value:'confirmado', label:'Confirmado' }, { value:'rechazado', label:'Rechazado' }, { value:'anulado', label:'Anulado' }],
  'facturas.estado': [{ value:'emitida', label:'Emitida' }, { value:'anulada', label:'Anulada' }],
};

const relationConfig = {
  'reservaciones.id_cliente': { table:'clientes', valueKey:'id_cliente', label: row => `${row.persona?.nombre || ''} ${row.persona?.apellidos || ''}`.trim() || `Cliente #${row.id_cliente}` },
  'reservaciones.id_empleado': { table:'empleados', valueKey:'id_empleado', label: row => `${row.persona?.nombre || ''} ${row.persona?.apellidos || ''}`.trim() || `Empleado #${row.id_empleado}` },
  'pagos.id_reservacion': { table:'reservaciones', valueKey:'id_reservacion', label: row => `#${row.id_reservacion} · ${formatDate(row.fecha_entrada) || 'Sin fecha'}` },
  'facturas.id_reservacion': { table:'reservaciones', valueKey:'id_reservacion', label: row => {
    const person = row.cliente?.persona;
    const client = `${person?.nombre || ''} ${person?.apellidos || ''}`.trim();
    return `#${row.id_reservacion} · ${client || 'Cliente sin nombre'} · ${formatDate(row.fecha_entrada) || 'Sin fecha'}`;
  } },
};

const isDateField = key => key.startsWith('fecha_') || key === 'fecha_entrada' || key === 'fecha_salida';
const isMoneyField = key => ['monto','precio','subtotal','impuestos','total'].includes(key);
const formatDate = value => { if (!value) return ''; const text = String(value).slice(0, 10); const parts = text.split('-'); return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : String(value); };
const formatMoney = value => `₡${Number(value || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const relationKey = (table, key) => `${table}.${key}`;
const isSingleReservationRelation = table => table === 'pagos' || table === 'facturas';

export default function CrudPage({ table, title, description = `Administración de ${title.toLowerCase()}.` }) {
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[success,setSuccess]=useState(''),[query,setQuery]=useState(''),[editing,setEditing]=useState(null),[form,setForm]=useState({}),[saving,setSaving]=useState(false),[viewing,setViewing]=useState(null),[relations,setRelations]=useState({});

  const load=async()=>{setLoading(true);setError('');try{const result=await api.list(table);setRows(result.data||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
  const loadRelations=async()=>{const needed=Object.entries(relationConfig).filter(([key])=>key.startsWith(`${table}.`));if(!needed.length)return;try{const entries=await Promise.all(needed.map(async([key,config])=>{const result=await api.list(config.table);return [key,result.data||[]];}));setRelations(Object.fromEntries(entries));}catch(e){setError(e.message);}};
  useEffect(()=>{load();loadRelations();},[table]);
  useEffect(()=>{if(!success)return;const timer=setTimeout(()=>setSuccess(''),3000);return()=>clearTimeout(timer);},[success]);

  const columns=useMemo(()=>rows[0]?Object.keys(rows[0]).filter(k=>typeof rows[0][k] !== 'object' && k !== 'porcentaje_impuesto' && k !== 'cliente_nombre' || k === 'cliente_nombre'):[],[rows]);
  const filtered=rows.filter(row=>JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const getRelationLabel=(key,value)=>{const config=relationConfig[relationKey(table,key)];if(!config)return value;const row=(relations[relationKey(table,key)]||[]).find(item=>String(item[config.valueKey])===String(value));return row?config.label(row):`#${value}`;};
  const displayValue=(key,value)=>{
    if(value===null||value==='')return '—';
    if(isDateField(key))return formatDate(value);
    if(table==='facturas' && ['subtotal','impuestos','total'].includes(key))return formatMoney(value);
    if(relationConfig[relationKey(table,key)])return getRelationLabel(key,value);
    return value;
  };
  const openNew=()=>{setEditing('new');setForm({});setError('');setSuccess('');};
  const openEdit=row=>{setEditing(row[Object.keys(row).find(k=>k.startsWith('id_'))]);setForm({...row});setError('');setSuccess('');};
  const save=async e=>{e.preventDefault();setError('');setSuccess('');const requiredKey=editableKeys.find(k=>(enumOptions[`${table}.${k}`]||relationConfig[relationKey(table,k)])&&!form[k]);if(requiredKey){setError(`Debes seleccionar ${labels[requiredKey]?.toLowerCase()||requiredKey.replaceAll('_',' ')}.`);return;}setSaving(true);try{const idKey=Object.keys(form).find(k=>k.startsWith('id_')&&k===`id_${table.replace(/s$/,'')}`);const data={...form};Object.keys(data).filter(k=>k.startsWith('id_')&&(!data[k]||k===idKey)).forEach(k=>delete data[k]);Object.keys(data).filter(k=>relationConfig[relationKey(table,k)]).forEach(k=>{if(data[k]!==''&&data[k]!==null)data[k]=Number(data[k]);});Object.keys(data).filter(k=>isMoneyField(k)).forEach(k=>{if(data[k]!==''&&data[k]!==null)data[k]=Number(data[k]);});if(editing==='new')await api.create(table,data);else {const primary=columns.find(k=>k.startsWith('id_'));await api.update(table,editing,Object.fromEntries(Object.entries(data).filter(([k])=>k!==primary)));}setEditing(null);await load();setSuccess(editing==='new'?'Registro creado correctamente.':'Registro actualizado correctamente.');}catch(e){setError(e.message);}finally{setSaving(false);}};
  const remove=async row=>{const primary=Object.keys(row).find(k=>k.startsWith('id_'));if(!primary||!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.'))return;setError('');setSuccess('');try{await api.remove(table,row[primary]);await load();setSuccess('Registro eliminado correctamente.');}catch(e){setError(e.message);}};
  const editableKeys = table === 'facturas'
    ? ['id_reservacion']
    : rows[0]
      ? Object.keys(rows[0]).filter(k => !k.startsWith('id_') || k === 'id_persona' || relationConfig[relationKey(table,k)])
      : Object.keys(form).filter(k => !k.startsWith('id_') || relationConfig[relationKey(table,k)]);
  const reservationRelationKey = relationKey(table, 'id_reservacion');
  const usedReservationIds = new Set(rows.map(row => row.id_reservacion).filter(Boolean).map(Number));
  const printInvoice = row => {
    const html = `<!doctype html><html><head><title>Factura ${row.numero_factura || ''}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#25304a;background:#f8f8fb}.invoice{max-width:720px;margin:auto;background:#fff;border:1px solid #ddd;border-radius:14px;padding:32px}.brand{color:#6f63a9;letter-spacing:3px;font-size:11px;font-weight:800}.title{font-size:28px;margin:8px 0 4px}.meta{color:#707890;margin:0 0 24px}.row{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-bottom:1px solid #eee}.total{font-size:20px;font-weight:700;padding-top:18px}.status{display:inline-block;padding:7px 12px;border-radius:999px;background:#e8f5ef;color:#28735a;font-weight:700}</style></head><body><div class="invoice"><div class="brand">DALSSI HOTEL</div><div class="title">Factura ${row.numero_factura || ''}</div><p class="meta">Emisión: ${formatDate(row.fecha_emision) || '—'}</p><div class="row"><span>Reservación</span><strong>#${row.id_reservacion ?? '—'}</strong></div><div class="row"><span>Cliente</span><strong>${row.cliente_nombre || '—'}</strong></div><div class="row"><span>Subtotal</span><strong>${formatMoney(row.subtotal)}</strong></div><div class="row"><span>Impuesto (${Number(row.porcentaje_impuesto || 0)}%)</span><strong>${formatMoney(row.impuestos)}</strong></div><div class="row total"><span>Total</span><strong>${formatMoney(row.total)}</strong></div><div class="row"><span>Estado</span><strong class="status">${row.estado || '—'}</strong></div></div><script>window.onload=()=>window.print();</script></body></html>`;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) { setError('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para imprimir la factura.'); return; }
    printWindow.document.write(html); printWindow.document.close();
  };

  return <section className="crud-page">
    <div className="crud-heading"><div></div><button className="crud-primary" onClick={openNew}><Plus size={17}/> Nuevo registro</button></div>
    <div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Buscar ${title.toLowerCase()}...`}/></div><button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{filtered.length} registros</span></div>
    {error&&<div className="crud-error">{error}</div>}{success&&<div className="crud-success">{success}</div>}
    <div className="crud-table-wrap">{loading?<p className="crud-state">Cargando información...</p>:rows.length===0?<div className="crud-state">{error?'No se pudo cargar la información.':'Todavía no hay registros. Podés crear el primero.'}</div>:filtered.length===0?<div className="crud-state">No hay resultados para la búsqueda.</div>:<table className="crud-table"><thead><tr>{columns.map(k=><th key={k}>{labels[k]||k.replaceAll('_',' ')}</th>)}<th>Acciones</th></tr></thead><tbody>{filtered.map((row,i)=><tr key={row[Object.keys(row).find(k=>k.startsWith('id_'))]??i}>{columns.map(k=><td key={k}>{['estado','metodo_pago'].includes(k)?<EnumBadge field={k} value={row[k]}/>:displayValue(k,row[k])}</td>)}<td><div className="crud-actions"><button onClick={()=>setViewing(row)} title="Ver detalle"><Eye size={16}/></button>{table==='facturas'?<button className="invoice-print-action" onClick={()=>printInvoice(row)} title="Imprimir factura" aria-label="Imprimir factura"><Printer size={16}/></button>:<><button onClick={()=>openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={()=>remove(row)} title="Eliminar"><Trash2 size={16}/></button></>}</div></td></tr>)}</tbody></table>}</div>
    {viewing&&<DetailModal
      title={`${title} · detalle`}
      items={table==='facturas'
        ? [
            { label:'Reservación', value:displayValue('id_reservacion', viewing.id_reservacion) },
            { label:'Cliente', value:viewing.cliente_nombre || '—' },
            { label:'Número de factura', value:viewing.numero_factura || '—' },
            { label:'Fecha de emisión', value:formatDate(viewing.fecha_emision) || '—' },
            { label:'Subtotal', value:formatMoney(viewing.subtotal) },
            { label:`Impuesto (${Number(viewing.porcentaje_impuesto || 0)}%)`, value:formatMoney(viewing.impuestos) },
            { label:'Total', value:formatMoney(viewing.total) },
            { label:'Estado', value:<EnumBadge field="estado" value={viewing.estado}/> },
          ]
        : columns.map(k=>({label:labels[k]||k.replaceAll('_',' '),value:['estado','metodo_pago'].includes(k)?<EnumBadge field={k} value={viewing[k]}/>:displayValue(k,viewing[k])}))}
      onClose={()=>setViewing(null)}
      onPrint={table==='facturas'?()=>printInvoice(viewing):undefined}
      printLabel={table==='facturas'?'Imprimir factura':undefined}
    />} 
    {editing!==null&&<div className="crud-modal-backdrop"><form className="crud-modal" onSubmit={save}><div className="crud-modal-head"><h3>{editing==='new'?'Nuevo registro':`Editar ${title.toLowerCase()}`}</h3><button type="button" onClick={()=>setEditing(null)}><X/></button></div><div className="crud-form-grid">{editableKeys.map(k=>{const options=enumOptions[`${table}.${k}`];const relation=relationConfig[relationKey(table,k)];const relationOptions=relation?(relations[relationKey(table,k)]||[]).filter(row=>{
          if (relationKey(table,k) !== reservationRelationKey) return true;
          const currentId = editing !== 'new' ? Number(form[k]) : null;
          return !usedReservationIds.has(Number(row[relation.valueKey])) || Number(row[relation.valueKey]) === currentId;
        }).map(row=>({value:row[relation.valueKey],label:relation.label(row)})):[];const required=Boolean(options||relation);return <label key={k}>{labels[k]||k.replaceAll('_',' ')}{options?<Select value={form[k]??''} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} placeholder={`Seleccione ${labels[k]?.toLowerCase()||k.replaceAll('_',' ')}`} options={options}/>:relation?<Select value={form[k]??''} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} placeholder={`Seleccione ${labels[k]?.toLowerCase()||k.replaceAll('_',' ')}`} options={relationOptions}/>:isDateField(k)?<DatePicker value={form[k]??''} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))}/>:<input required={required} type={isMoneyField(k)?'number':'text'} min={isMoneyField(k)?'0':undefined} step={isMoneyField(k)?'0.01':undefined} value={form[k]??''} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} placeholder={labels[k]||k}/>}</label>;})}</div><div className="crud-modal-actions"><button type="button" className="crud-secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="crud-primary" disabled={saving}><Save size={16}/>{saving?'Guardando...':'Guardar'}</button></div></form></div>}
  </section>;
}
