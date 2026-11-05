import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X, Save } from 'lucide-react';
import { api } from '../../services/api.js';
import './CatalogManager.css';

export default function CatalogManager({ table, title, fields = [{ key: 'nombre', label: 'Nombre', required: true }], onClose, onChanged }) {
  const [rows,setRows]=useState([]),[form,setForm]=useState({}),[editing,setEditing]=useState(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState('');

  const load=async()=>{setLoading(true);try{const result=await api.list(table);setRows(result.data||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const openNew=()=>{setForm(Object.fromEntries(fields.map(f=>[f.key,''])));setEditing('new');setError('');};
  const openEdit=(row)=>{setForm(Object.fromEntries(fields.map(f=>[f.key,row[f.key]??''])));setEditing(row[Object.keys(row).find(k=>k.startsWith('id_'))]);setError('');};
  const save=async(e)=>{e.preventDefault();setSaving(true);setError('');try{if(editing==='new')await api.create(table,form);else await api.update(table,editing,form);setEditing(null);await load();onChanged?.();}catch(e){setError(e.message);}finally{setSaving(false);}};
  const remove=async(row)=>{const id=Object.keys(row).find(k=>k.startsWith('id_'));if(!id||!confirm(`¿Eliminar ${title.toLowerCase().replace(/^gestión de /,'')}?`))return;try{await api.remove(table,row[id]);await load();onChanged?.();}catch(e){setError(e.message);}};
  return <div className="catalog-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}>
    <div className="catalog-modal">
      <div className="catalog-head"><div><span>CATÁLOGO</span><h3>Gestionar {title}</h3></div><button onClick={onClose}><X size={19}/></button></div>
      {error&&<div className="crud-error">{error}</div>}
      <div className="catalog-list">{loading?<p className="crud-state">Cargando...</p>:rows.length===0?<p className="crud-state">No hay registros.</p>:rows.map(row=><div className="catalog-row" key={Object.keys(row).find(k=>k.startsWith('id_'))}><div><strong>{row.nombre||'—'}</strong>{row.descripcion&&<small>{row.descripcion}</small>}</div><div className="catalog-actions"><button onClick={()=>openEdit(row)} title="Editar"><Pencil size={15}/></button><button onClick={()=>remove(row)} title="Eliminar"><Trash2 size={15}/></button></div></div>)}</div>
      <button className="crud-primary catalog-add" onClick={openNew}><Plus size={16}/> Nuevo {title.replace(/^.*? /,'').toLowerCase()}</button>
      {editing!==null&&<div className="catalog-form"><div className="catalog-form-head"><strong>{editing==='new'?'Nuevo registro':'Editar registro'}</strong><button onClick={()=>setEditing(null)}><X size={16}/></button></div><form onSubmit={save}>{fields.map(f=><label key={f.key}>{f.label}{f.type==='textarea'?<textarea required={f.required} value={form[f.key]??''} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>:<input required={f.required} value={form[f.key]??''} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>}</label>)}<button className="crud-primary" disabled={saving}><Save size={15}/>{saving?'Guardando...':'Guardar'}</button></form></div>}
    </div>
  </div>;
}
