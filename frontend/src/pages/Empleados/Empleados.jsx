import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw, X, Save, Eye } from 'lucide-react';
import { api } from '../../services/api.js';
import Select from '../../components/Select/Select.jsx';
import DatePicker from '../../components/DatePicker/DatePicker.jsx';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import EnumBadge from '../../components/EnumBadge/EnumBadge.jsx';
import CatalogManager from '../../components/CatalogManager/CatalogManager.jsx';
import './Empleados.css';

const dateText = (value) => { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toLocaleDateString('es-CR'); };

const emptyForm = {
  identificacion: '',
  nombre: '',
  apellidos: '',
  telefono: '',
  correo: '',
  id_puesto: '',
  fecha_contratacion: '',
  estado: 'activo',
};

export default function Empleados() {
  const [rows, setRows] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [managePuestos, setManagePuestos] = useState(false);

  const loadPuestos = async () => {
    try {
      const result = await api.list('puesto');
      setPuestos(result.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.list('empleados');
      setRows(result.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadPuestos();
  }, []);

  const filtered = rows.filter((row) => {
    const persona = row.persona || {};
    return `${persona.identificacion} ${persona.nombre} ${persona.apellidos} ${persona.correo} ${row.puesto?.nombre || ''} ${row.estado}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
    setError('');
  };

  const openEdit = (row) => {
    const persona = row.persona || {};
    setForm({
      identificacion: persona.identificacion || '',
      nombre: persona.nombre || '',
      apellidos: persona.apellidos || '',
      telefono: persona.telefono || '',
      correo: persona.correo || '',
      id_puesto: row.id_puesto || '',
      fecha_contratacion: row.fecha_contratacion ? String(row.fecha_contratacion).slice(0, 10) : '',
      estado: row.estado || 'activo',
    });
    setEditing(row.id_empleado);
    setError('');
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const data = {
      persona: {
        identificacion: form.identificacion,
        nombre: form.nombre,
        apellidos: form.apellidos,
        telefono: form.telefono,
        correo: form.correo,
      },
      id_puesto: Number(form.id_puesto),
      fecha_contratacion: form.fecha_contratacion || null,
      estado: form.estado,
    };

    try {
      if (editing === 'new') await api.create('empleados', data);
      else await api.update('empleados', editing, data);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!confirm('¿Eliminar este empleado? La información de la persona se conservará.')) return;
    try {
      await api.remove('empleados', row.id_empleado);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="crud-page">
      <div className="crud-heading">
        <div><p className="crud-description">Personal del hotel y sus datos personales.</p></div>
        <button className="crud-primary" onClick={openNew}><Plus size={17} /> Nuevo empleado</button>
      </div>

      <div className="crud-toolbar">
        <div className="crud-search">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar empleados..." />
        </div>
        <button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17} /></button>
        <span>{filtered.length} registros</span>
      </div>

      {error && <div className="crud-error">{error}</div>}

      <div className="crud-table-wrap">
        {loading ? <p className="crud-state">Cargando información...</p> : filtered.length === 0 ? (
          <div className="crud-state">No hay empleados para mostrar.</div>
        ) : (
          <table className="crud-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Identificación</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Puesto</th>
                <th>Contratación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const persona = row.persona || {};
                return (
                  <tr key={row.id_empleado}>
                    <td>{`${persona.nombre || ''} ${persona.apellidos || ''}`.trim() || '—'}</td>
                    <td>{persona.identificacion || '—'}</td>
                    <td>{persona.telefono || '—'}</td>
                    <td>{persona.correo || '—'}</td>
                    <td>{row.puesto?.nombre || '—'}</td>
                    <td>{dateText(row.fecha_contratacion)}</td>
                    <td><EnumBadge value={row.estado} /></td>
                    <td>
                      <div className="crud-actions">
                        <button onClick={() => setViewing(row)} title="Ver detalle"><Eye size={16} /></button>
                        <button onClick={() => openEdit(row)} title="Editar"><Pencil size={16} /></button>
                        <button onClick={() => remove(row)} title="Eliminar"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {managePuestos && <CatalogManager table="puesto" title="puestos" onClose={() => setManagePuestos(false)} onChanged={loadPuestos} />}

      {viewing && (
        <DetailModal
          title={`${viewing.persona?.nombre || ''} ${viewing.persona?.apellidos || ''}`.trim() || 'Empleado'}
          items={[
            { label: 'Identificación', value: viewing.persona?.identificacion },
            { label: 'Teléfono', value: viewing.persona?.telefono },
            { label: 'Correo', value: viewing.persona?.correo },
            { label: 'Puesto', value: viewing.puesto?.nombre },
            { label: 'Contratación', value: viewing.fecha_contratacion ? String(viewing.fecha_contratacion).slice(0, 10) : '—' },
            { label: 'Estado', value: viewing.estado },
            { label: 'ID empleado', value: viewing.id_empleado },
          ]}
          onClose={() => setViewing(null)}
        />
      )}

      {editing !== null && (
        <div className="crud-modal-backdrop">
          <form className="crud-modal" onSubmit={save}>
            <div className="crud-modal-head">
              <h3>{editing === 'new' ? 'Nuevo empleado' : 'Editar empleado'}</h3>
              <button type="button" onClick={() => setEditing(null)}><X /></button>
            </div>

            <div className="crud-form-grid">
              <label>Identificación<input required value={form.identificacion} onChange={(e) => setForm({ ...form, identificacion: e.target.value })} /></label>
              <label>Nombre<input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
              <label>Apellidos<input required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} /></label>
              <label>Teléfono<input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></label>
              <label>Correo<input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></label>
              <label>Puesto<div className="select-with-action"><Select value={form.id_puesto} onChange={(e) => setForm({ ...form, id_puesto: e.target.value })} placeholder="Seleccione un puesto" options={puestos.map((puesto) => ({ value: puesto.id_puesto, label: puesto.nombre }))} /><button type="button" className="catalog-link" onClick={() => setManagePuestos(true)}>Gestionar</button></div></label>
              <label>Fecha de contratación<DatePicker value={form.fecha_contratacion} onChange={(e) => setForm({ ...form, fecha_contratacion: e.target.value })} /></label>
              <label>Estado<Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="Seleccione un estado" options={[{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }]} /></label>
            </div>

            <div className="crud-modal-actions">
              <button type="button" className="crud-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="crud-primary" disabled={saving}><Save size={16} />{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
