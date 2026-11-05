import { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2, X, Save } from 'lucide-react';
import { api } from '../../services/api.js';
import Select from '../../components/Select/Select.jsx';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import EnumBadge from '../../components/EnumBadge/EnumBadge.jsx';
import CatalogManager from '../../components/CatalogManager/CatalogManager.jsx';
import './Servicios.css';

const emptyForm={id_categoria_servicio:'',nombre:'',descripcion:'',precio:'',estado:'activo'};

export default function Servicios(){
  const [rows,setRows]=useState([]),[categorias,setCategorias]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState('');
  const [editing,setEditing]=useState(null),[viewing,setViewing]=useState(null),[manageCategorias,setManageCategorias]=useState(false),[form,setForm]=useState(emptyForm),[saving,setSaving]=useState(false);

  const load=async()=>{setLoading(true);setError('');try{const r=await api.list('servicios');setRows(r.data||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
  const loadCategorias=async()=>{try{const r=await api.list('categorias_servicios');setCategorias(r.data||[]);}catch(e){setError(e.message);}};
  useEffect(()=>{load();loadCategorias();},[]);
  const filtered=rows.filter(row=>`${row.nombre} ${row.descripcion} ${row.estado} ${categorias.find(c=>c.id_categoria_servicio===row.id_categoria_servicio)?.nombre||''}`.toLowerCase().includes(query.toLowerCase()));
  const openNew=()=>{setForm(emptyForm);setEditing('new');setError('');};
  const openEdit=row=>{setForm({id_categoria_servicio:row.id_categoria_servicio||'',nombre:row.nombre||'',descripcion:row.descripcion||'',precio:row.precio??'',estado:row.estado||'activo'});setEditing(row.id_servicio);setError('');};
  const save=async(e)=>{e.preventDefault();setSaving(true);setError('');try{const data={...form,id_categoria_servicio:Number(form.id_categoria_servicio),precio:Number(form.precio)};if(editing==='new')await api.create('servicios',data);else await api.update('servicios',editing,data);setEditing(null);await load();}catch(e){setError(e.message);}finally{setSaving(false);}};
  const remove=async(row)=>{if(!confirm('¿Eliminar este servicio?'))return;try{await api.remove('servicios',row.id_servicio);await load();}catch(e){setError(e.message);}};
  return <section className="crud-page">
    <div className="crud-heading"><div></div><button className="crud-primary" onClick={openNew}><Plus size={17}/> Nuevo servicio</button></div>
    <div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar servicios..."/></div><button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{filtered.length} registros</span></div>
    {error&&<div className="crud-error">{error}</div>}
    <div className="crud-table-wrap">{loading?<p className="crud-state">Cargando información...</p>:filtered.length===0?<div className="crud-state">No hay servicios para mostrar.</div>:
      <table className="crud-table"><thead><tr><th>Nombre</th><th>Categoría</th><th>Descripción</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>{filtered.map(row=>{const cat=categorias.find(c=>c.id_categoria_servicio===row.id_categoria_servicio);return <tr key={row.id_servicio}><td>{row.nombre||'—'}</td><td>{cat?.nombre||'—'}</td><td>{row.descripcion||'—'}</td><td>{row.precio!==null&&row.precio!==undefined?`₡${Number(row.precio).toLocaleString('es-CR')}`:'—'}</td><td><EnumBadge field="estado" value={row.estado} /></td><td><div className="crud-actions"><button onClick={()=>setViewing(row)} title="Ver detalle"><Eye size={16}/></button><button onClick={()=>openEdit(row)} title="Editar"><Pencil size={16}/></button><button onClick={()=>remove(row)} title="Eliminar"><Trash2 size={16}/></button></div></td></tr>})}</tbody></table>}
    </div>

    {editing!==null&&<div className="crud-modal-backdrop"><form className="crud-modal" onSubmit={save}>
      <div className="crud-modal-head"><h3>{editing==='new'?'Nuevo servicio':'Editar servicio'}</h3><button type="button" onClick={()=>setEditing(null)}><X/></button></div>
      <div className="crud-form-grid">
        <label>Categoría<div className="select-with-action"><Select value={form.id_categoria_servicio} onChange={e=>setForm({...form,id_categoria_servicio:e.target.value})} placeholder="Seleccione una categoría" options={categorias.map(c=>({value:c.id_categoria_servicio,label:c.nombre}))}/><button type="button" className="catalog-link" onClick={()=>setManageCategorias(true)}>Gestionar</button></div></label>
        <label>Nombre<input required value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></label>
        <label>Descripción<textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})}/></label>
        <label>Precio<input required type="number" min="0" step="0.01" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})}/></label>
        <label>Estado<Select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} placeholder="Seleccione un estado" options={[{value:'activo',label:'Activo'},{value:'inactivo',label:'Inactivo'}]}/></label>
      </div>
      <div className="crud-modal-actions"><button type="button" className="crud-secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="crud-primary" disabled={saving}><Save size={16}/>{saving?'Guardando...':'Guardar'}</button></div>
    </form></div>}

    {manageCategorias&&<CatalogManager table="categorias_servicios" title="categorías de servicios" fields={[{key:'nombre',label:'Nombre',required:true},{key:'descripcion',label:'Descripción',type:'textarea'},{key:'estado',label:'Estado',required:true}]} onClose={()=>setManageCategorias(false)} onChanged={loadCategorias}/>}
    {viewing&&<DetailModal title={viewing.nombre||'Servicio'} items={[{label:'Categoría',value:categorias.find(c=>c.id_categoria_servicio===viewing.id_categoria_servicio)?.nombre},{label:'Descripción',value:viewing.descripcion},{label:'Precio',value:viewing.precio!==undefined?`₡${Number(viewing.precio).toLocaleString('es-CR')}`:'—'},{label:'Estado',value:<EnumBadge field="estado" value={viewing.estado}/>},{label:'ID servicio',value:viewing.id_servicio}]} onClose={()=>setViewing(null)}/>}
  </section>;
}
