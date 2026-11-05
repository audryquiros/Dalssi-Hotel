import { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2, X, Save } from 'lucide-react';
import { api } from '../../services/api.js';
import Select from '../../components/Select/Select.jsx';
import DatePicker from '../../components/DatePicker/DatePicker.jsx';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import './Clientes.css';

const emptyForm = { identificacion:'', nombre:'', apellidos:'', telefono:'', correo:'', direccion:'', fecha_registro:'' };

const dateText = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0,10) : date.toLocaleDateString('es-CR');
};

export default function Clientes() {
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState('');
  const [editing,setEditing]=useState(null),[viewing,setViewing]=useState(null),[form,setForm]=useState(emptyForm),[saving,setSaving]=useState(false);

  const load=async()=>{setLoading(true);setError('');try{const result=await api.list('clientes');setRows(result.data||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);

  const filtered=rows.filter(row=>{
    const p=row.persona||{};
    return `${p.nombre} ${p.apellidos} ${p.identificacion} ${p.telefono} ${p.correo} ${row.direccion}`.toLowerCase().includes(query.toLowerCase());
  });

  const openNew=()=>{setForm(emptyForm);setEditing('new');setError('');};
  const openEdit=(row)=>{const p=row.persona||{};setForm({
    identificacion:p.identificacion||'',nombre:p.nombre||'',apellidos:p.apellidos||'',telefono:p.telefono||'',correo:p.correo||'',
    direccion:row.direccion||'',fecha_registro:row.fecha_registro?String(row.fecha_registro).slice(0,10):''
  });setEditing(row.id_cliente);setError('');};

  const save=async(e)=>{e.preventDefault();setSaving(true);setError('');const data={persona:{identificacion:form.identificacion,nombre:form.nombre,apellidos:form.apellidos,telefono:form.telefono,correo:form.correo},direccion:form.direccion,fecha_registro:form.fecha_registro||null};
    try{if(editing==='new')await api.create('clientes',data);else await api.update('clientes',editing,data);setEditing(null);await load();}catch(e){setError(e.message);}finally{setSaving(false);}
  };
  const remove=async(row)=>{if(!confirm('¿Eliminar este cliente? También se eliminarán sus datos personales.'))return;try{await api.remove('clientes',row.id_cliente);await load();}catch(e){setError(e.message);}};

  return <section className="crud-page">
<div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar clientes..."/></div><button className="crud-primary crud-toolbar-primary" onClick={openNew}><Plus size={17} /> Nuevo cliente</button><button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{filtered.length} registros</span></div>
    {error&&<div className="crud-error">{error}</div>}
    <div className="crud-table-wrap">{loading?<p className="crud-state">Cargando información...</p>:filtered.length===0?<div className="crud-state">No hay clientes para mostrar.</div>:
      <table className="crud-table"><thead><tr><th>Nombre</th><th>Identificación</th><th>Teléfono</th><th>Correo</th><th>Dirección</th><th>Registro</th><th>Acciones</th></tr></thead>
      <tbody>{filtered.map(row=>{const p=row.persona||{};return <tr key={row.id_cliente}><td>{`${p.nombre||''} ${p.apellidos||''}`.trim()||'—'}</td><td>{p.identificacion||'—'}</td><td>{p.telefono||'—'}</td><td>{p.correo||'—'}</td><td>{row.direccion||'—'}</td><td>{dateText(row.fecha_registro)}</td><td><div className="crud-actions"><button onClick={()=>setViewing(row)} title="Ver detalle"><Eye size={16}/></button><button onClick={()=>openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={()=>remove(row)} title="Eliminar"><Trash2 size={16}/></button></div></td></tr>})}</tbody></table>}
    </div>

    {editing!==null&&<div className="crud-modal-backdrop"><form className="crud-modal" onSubmit={save}>
      <div className="crud-modal-head"><h3>{editing==='new'?'Nuevo cliente':'Editar cliente'}</h3><button type="button" onClick={()=>setEditing(null)}><X/></button></div>
      <div className="crud-form-grid">
        <label>Identificación<input required value={form.identificacion} onChange={e=>setForm({...form,identificacion:e.target.value})}/></label>
        <label>Nombre<input required value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></label>
        <label>Apellidos<input required value={form.apellidos} onChange={e=>setForm({...form,apellidos:e.target.value})}/></label>
        <label>Teléfono<input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></label>
        <label>Correo<input type="email" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})}/></label>
        <label>Dirección<input value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})}/></label>
        <label>Fecha de registro<DatePicker value={form.fecha_registro} onChange={e=>setForm({...form,fecha_registro:e.target.value})}/></label>
      </div>
      <div className="crud-modal-actions"><button type="button" className="crud-secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="crud-primary" disabled={saving}><Save size={16}/>{saving?'Guardando...':'Guardar'}</button></div>
    </form></div>}

    {viewing&&<DetailModal title={`${viewing.persona?.nombre||''} ${viewing.persona?.apellidos||''}`.trim()||'Cliente'} items={[
      {label:'Identificación',value:viewing.persona?.identificacion},{label:'Teléfono',value:viewing.persona?.telefono},{label:'Correo',value:viewing.persona?.correo},
      {label:'Dirección',value:viewing.direccion},{label:'Fecha de registro',value:dateText(viewing.fecha_registro)},{label:'ID cliente',value:viewing.id_cliente}
    ]} onClose={()=>setViewing(null)}/>}
  </section>;
}
