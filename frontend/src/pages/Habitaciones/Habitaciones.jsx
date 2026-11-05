import { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2, X, Save } from 'lucide-react';
import { api } from '../../services/api.js';
import Select from '../../components/Select/Select.jsx';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import EnumBadge from '../../components/EnumBadge/EnumBadge.jsx';
import CatalogManager from '../../components/CatalogManager/CatalogManager.jsx';
import './Habitaciones.css';

const emptyForm={id_tipo_habitacion:'',numero:'',piso:'',ubicacion:'',descripcion:'',estado:'disponible'};

export default function Habitaciones(){
  const [rows,setRows]=useState([]),[tipos,setTipos]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState('');
  const [editing,setEditing]=useState(null),[viewing,setViewing]=useState(null),[manageTipos,setManageTipos]=useState(false),[form,setForm]=useState(emptyForm),[saving,setSaving]=useState(false);
  const load=async()=>{setLoading(true);setError('');try{const r=await api.list('habitaciones');setRows(r.data||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
  const loadTipos=async()=>{try{const r=await api.list('tipos_habitacion');setTipos(r.data||[]);}catch(e){setError(e.message);}};
  useEffect(()=>{load();loadTipos();},[]);
  const filtered=rows.filter(row=>`${row.numero} ${row.piso} ${row.ubicacion} ${row.estado} ${tipos.find(t=>t.id_tipo_habitacion===row.id_tipo_habitacion)?.nombre||''}`.toLowerCase().includes(query.toLowerCase()));
  const openNew=()=>{setForm(emptyForm);setEditing('new');setError('');};
  const openEdit=row=>{setForm({id_tipo_habitacion:row.id_tipo_habitacion||'',numero:row.numero||'',piso:row.piso??'',ubicacion:row.ubicacion||'',descripcion:row.descripcion||'',estado:row.estado||'disponible'});setEditing(row.id_habitacion);setError('');};
  const save=async(e)=>{e.preventDefault();setSaving(true);setError('');try{const data={...form,id_tipo_habitacion:Number(form.id_tipo_habitacion),piso:form.piso?Number(form.piso):null};if(editing==='new')await api.create('habitaciones',data);else await api.update('habitaciones',editing,data);setEditing(null);await load();}catch(e){setError(e.message);}finally{setSaving(false);}};
  const remove=async(row)=>{if(!confirm('¿Eliminar esta habitación?'))return;try{await api.remove('habitaciones',row.id_habitacion);await load();}catch(e){setError(e.message);}};
  const estados=[{value:'disponible',label:'Disponible'},{value:'ocupada',label:'Ocupada'},{value:'mantenimiento',label:'Mantenimiento'},{value:'limpieza',label:'Limpieza'}];
  return <section className="crud-page">
    <div className="crud-heading"><div><p className="crud-description">Habitaciones, tipos, ubicación y disponibilidad del hotel.</p></div><button className="crud-primary" onClick={openNew}><Plus size={17}/> Nueva habitación</button></div>
    <div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar habitaciones..."/></div><button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{filtered.length} registros</span></div>
    {error&&<div className="crud-error">{error}</div>}
    <div className="crud-table-wrap">{loading?<p className="crud-state">Cargando información...</p>:filtered.length===0?<div className="crud-state">No hay habitaciones para mostrar.</div>:
      <table className="crud-table"><thead><tr><th>Número</th><th>Tipo</th><th>Piso</th><th>Ubicación</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>{filtered.map(row=>{const tipo=tipos.find(t=>t.id_tipo_habitacion===row.id_tipo_habitacion);return <tr key={row.id_habitacion}><td>{row.numero||'—'}</td><td>{tipo?.nombre||'—'}</td><td>{row.piso??'—'}</td><td>{row.ubicacion||'—'}</td><td><EnumBadge value={row.estado} /></td><td><div className="crud-actions"><button onClick={()=>setViewing(row)} title="Ver detalle"><Eye size={16}/></button><button onClick={()=>openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={()=>remove(row)} title="Eliminar"><Trash2 size={16}/></button></div></td></tr>})}</tbody></table>}
    </div>
    {editing!==null&&<div className="crud-modal-backdrop"><form className="crud-modal" onSubmit={save}>
      <div className="crud-modal-head"><h3>{editing==='new'?'Nueva habitación':'Editar habitación'}</h3><button type="button" onClick={()=>setEditing(null)}><X/></button></div>
      <div className="crud-form-grid">
        <label>Tipo de habitación<div className="select-with-action"><Select value={form.id_tipo_habitacion} onChange={e=>setForm({...form,id_tipo_habitacion:e.target.value})} placeholder="Seleccione un tipo" options={tipos.map(t=>({value:t.id_tipo_habitacion,label:t.nombre}))}/><button type="button" className="catalog-link" onClick={()=>setManageTipos(true)}>Gestionar</button></div></label>
        <label>Número<input required value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})}/></label>
        <label>Piso<input type="number" value={form.piso} onChange={e=>setForm({...form,piso:e.target.value})}/></label>
        <label>Ubicación<input value={form.ubicacion} onChange={e=>setForm({...form,ubicacion:e.target.value})}/></label>
        <label>Descripción<textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})}/></label>
        <label>Estado<Select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} placeholder="Seleccione un estado" options={estados}/></label>
      </div>
      <div className="crud-modal-actions"><button type="button" className="crud-secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="crud-primary" disabled={saving}><Save size={16}/>{saving?'Guardando...':'Guardar'}</button></div>
    </form></div>}
    {manageTipos&&<CatalogManager table="tipos_habitacion" title="tipos de habitación" fields={[{key:'nombre',label:'Nombre',required:true},{key:'descripcion',label:'Descripción',type:'textarea'},{key:'capacidad',label:'Capacidad',required:true},{key:'precio_base',label:'Precio base',required:true}]} onClose={()=>setManageTipos(false)} onChanged={loadTipos}/>}
    {viewing&&<DetailModal title={`Habitación ${viewing.numero||''}`} items={[{label:'Tipo',value:tipos.find(t=>t.id_tipo_habitacion===viewing.id_tipo_habitacion)?.nombre},{label:'Piso',value:viewing.piso},{label:'Ubicación',value:viewing.ubicacion},{label:'Descripción',value:viewing.descripcion},{label:'Estado',value:viewing.estado},{label:'ID habitación',value:viewing.id_habitacion}]} onClose={()=>setViewing(null)}/>}
  </section>;
}
