import { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2, X, Save } from 'lucide-react';
import { api } from '../../services/api.js';
import Select from '../../components/Select/Select.jsx';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import './Huespedes.css';

const emptyForm = { identificacion:'', nombre:'', apellidos:'', telefono:'', correo:'', id_pais:'' };

export default function Huespedes() {
  const [rows,setRows]=useState([]),[paises,setPaises]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState('');
  const [editing,setEditing]=useState(null),[viewing,setViewing]=useState(null),[form,setForm]=useState(emptyForm),[saving,setSaving]=useState(false);

  const load=async()=>{setLoading(true);setError('');try{const result=await api.list('huespedes');setRows(result.data||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
  const loadPaises=async()=>{try{const result=await api.list('paises');setPaises(result.data||[]);}catch(e){setError(e.message);}};
  useEffect(()=>{load();loadPaises();},[]);

  const filtered=rows.filter(row=>{const p=row.persona||{};return `${p.nombre} ${p.apellidos} ${p.identificacion} ${p.telefono} ${p.correo} ${row.pais?.nombre||''}`.toLowerCase().includes(query.toLowerCase());});
  const openNew=()=>{setForm(emptyForm);setEditing('new');setError('');};
  const openEdit=(row)=>{const p=row.persona||{};setForm({identificacion:p.identificacion||'',nombre:p.nombre||'',apellidos:p.apellidos||'',telefono:p.telefono||'',correo:p.correo||'',id_pais:row.id_pais||''});setEditing(row.id_huesped);setError('');};

  const save=async(e)=>{e.preventDefault();setSaving(true);setError('');const data={persona:{identificacion:form.identificacion,nombre:form.nombre,apellidos:form.apellidos,telefono:form.telefono,correo:form.correo},id_pais:Number(form.id_pais)};
    try{if(editing==='new')await api.create('huespedes',data);else await api.update('huespedes',editing,data);setEditing(null);await load();}catch(e){setError(e.message);}finally{setSaving(false);}
  };
  const remove=async(row)=>{if(!confirm('¿Eliminar este huésped? También se eliminarán sus datos personales.'))return;try{await api.remove('huespedes',row.id_huesped);await load();}catch(e){setError(e.message);}};

  return <section className="crud-page">
    <div className="crud-heading"><div><h2>Administración de huéspedes</h2><p>Huéspedes registrados y sus datos personales.</p></div><button className="crud-primary" onClick={openNew}><Plus size={17}/> Nuevo huésped</button></div>
    <div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar huéspedes..."/></div><button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{filtered.length} registros</span></div>
    {error&&<div className="crud-error">{error}</div>}
    <div className="crud-table-wrap">{loading?<p className="crud-state">Cargando información...</p>:filtered.length===0?<div className="crud-state">No hay huéspedes para mostrar.</div>:
      <table className="crud-table"><thead><tr><th>Nombre</th><th>Identificación</th><th>Teléfono</th><th>Correo</th><th>País</th><th>Acciones</th></tr></thead>
      <tbody>{filtered.map(row=>{const p=row.persona||{};return <tr key={row.id_huesped}><td>{`${p.nombre||''} ${p.apellidos||''}`.trim()||'—'}</td><td>{p.identificacion||'—'}</td><td>{p.telefono||'—'}</td><td>{p.correo||'—'}</td><td>{row.pais?.nombre||'—'}</td><td><div className="crud-actions"><button onClick={()=>setViewing(row)} title="Ver detalle"><Eye size={16}/></button><button onClick={()=>openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={()=>remove(row)} title="Eliminar"><Trash2 size={16}/></button></div></td></tr>})}</tbody></table>}
    </div>

    {editing!==null&&<div className="crud-modal-backdrop"><form className="crud-modal" onSubmit={save}>
      <div className="crud-modal-head"><h3>{editing==='new'?'Nuevo huésped':'Editar huésped'}</h3><button type="button" onClick={()=>setEditing(null)}><X/></button></div>
      <div className="crud-form-grid">
        <label>Identificación<input required value={form.identificacion} onChange={e=>setForm({...form,identificacion:e.target.value})}/></label>
        <label>Nombre<input required value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></label>
        <label>Apellidos<input required value={form.apellidos} onChange={e=>setForm({...form,apellidos:e.target.value})}/></label>
        <label>Teléfono<input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></label>
        <label>Correo<input type="email" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})}/></label>
        <label>País<Select value={form.id_pais} onChange={e=>setForm({...form,id_pais:e.target.value})} placeholder="Seleccione un país" options={paises.map(p=>({value:p.id_pais,label:p.nombre}))}/></label>
      </div>
      <div className="crud-modal-actions"><button type="button" className="crud-secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="crud-primary" disabled={saving}><Save size={16}/>{saving?'Guardando...':'Guardar'}</button></div>
    </form></div>}

    {viewing&&<DetailModal title={`${viewing.persona?.nombre||''} ${viewing.persona?.apellidos||''}`.trim()||'Huésped'} items={[
      {label:'Identificación',value:viewing.persona?.identificacion},{label:'Teléfono',value:viewing.persona?.telefono},{label:'Correo',value:viewing.persona?.correo},
      {label:'País',value:viewing.pais?.nombre},{label:'Nacionalidad',value:viewing.pais?.nacionalidad},{label:'ID huésped',value:viewing.id_huesped}
    ]} onClose={()=>setViewing(null)}/>}
  </section>;
}
