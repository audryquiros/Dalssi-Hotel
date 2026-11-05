import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, FileText, Hotel, Pencil, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api.js'
import './ClientReservations.css'

const labels = { pendiente:'Pendiente', confirmada:'Confirmada', en_curso:'En curso', finalizada:'Finalizada', cancelada:'Cancelada' }
const today = () => new Date().toISOString().slice(0, 10)
const formatDate = (value, long = false) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-CR', long ? { day:'numeric', month:'long', year:'numeric' } : { day:'2-digit', month:'short' }) : '—'
const editable = (item) => !['cancelada','finalizada','en_curso'].includes(item.estado) && String(item.fecha_entrada || '') >= today()

export default function ClientReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [rooms, setRooms] = useState([])

  const load = () => {
    setLoading(true)
    api.clientReservations().then(({ data }) => setReservations(data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const groups = useMemo(() => ({ upcoming: reservations.filter(editable), other: reservations.filter((item) => !editable(item)) }), [reservations])

  const openDetail = async (item) => {
    try {
      const { data } = await api.clientReservation(item.id_reservacion)
      setSelected(data)
    } catch (err) { setError(err.message) }
  }

  const openEdit = async (item) => {
    setSaveError('')
    try { const { data } = await api.clientRooms(); setRooms(data || []) } catch { setRooms([]) }
    setEditing({ id_reservacion:item.id_reservacion, fecha_entrada:item.fecha_entrada || '', fecha_salida:item.fecha_salida || '', observaciones:item.observaciones || '', id_habitacion:item.detalle_reservacion?.[0]?.id_habitacion || '' })
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true); setSaveError('')
    try {
      await api.updateClientReservation(editing.id_reservacion, editing)
      setEditing(null)
      setSelected(null)
      load()
    } catch (err) { setSaveError(err.message) }
    finally { setSaving(false) }
  }

  return <div className="client-reservations">
    <header className="client-simple-nav">
      <Link to="/cliente"><ArrowLeft size={16}/> Volver a Dalssi</Link>
      <Link to="/cliente" className="landing-brand"><img src="/logo/dalssi-isotipo.png" alt=""/><div><strong>DALSSI</strong><span>HOTEL</span></div></Link>
    </header>

    <main>
      <div className="stay-hero">
        <div><span className="landing-kicker"><CalendarDays size={14}/> MI ESTADÍA</span><h1>Tu tiempo en Dalssi.</h1><p>Todo lo que necesitas para disfrutar tu visita, antes, durante y después de quedarte con nosotros.</p></div>
        <div className="stay-hero-art"><div className="stay-art-ring"/><Hotel size={38}/><span>Descanso · Calma · Hogar</span></div>
      </div>

      {loading ? <div className="client-empty">Cargando tus estadías...</div> : error ? <div className="client-error">{error}</div> : reservations.length === 0 ? <div className="client-empty"><CalendarDays size={28}/><h2>Aún no tienes reservaciones</h2><p>Cuando quieras hacer tu próxima escapada, Dalssi estará aquí.</p><Link to="/cliente" className="primary-cta">Explorar Dalssi <ChevronRight size={16}/></Link></div> : <>
        {groups.upcoming.length > 0 && <section className="stay-section"><div className="stay-section-heading"><div><span className="landing-kicker">PRÓXIMAS ESTADÍAS</span><h2>Lo que viene.</h2></div><span className="stay-count">{groups.upcoming.length} {groups.upcoming.length === 1 ? 'estadía' : 'estadías'}</span></div><div className="stay-grid">{groups.upcoming.map((item) => <StayCard key={item.id_reservacion} item={item} upcoming onDetail={() => openDetail(item)} onEdit={() => openEdit(item)} />)}</div></section>}
        {groups.other.length > 0 && <section className="stay-section past-section"><div className="stay-section-heading"><div><span className="landing-kicker">TU HISTORIA CON DALSSI</span><h2>Lo que ya viviste.</h2></div></div><div className="stay-grid">{groups.other.map((item) => <StayCard key={item.id_reservacion} item={item} onDetail={() => openDetail(item)} />)}</div></section>}
      </>}
    </main>

    {selected && <div className="stay-modal-backdrop" onClick={() => setSelected(null)}><div className="stay-modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setSelected(null)}><X size={18}/></button>
      <span className="landing-kicker">RESERVACIÓN #{selected.id_reservacion}</span>
      <h2>{formatDate(selected.fecha_entrada, true)} <em>→</em> {formatDate(selected.fecha_salida, true)}</h2>
      <span className={`reservation-status status-${selected.estado}`}>{labels[selected.estado] || selected.estado}</span>
      <div className="stay-detail-grid">
        <div><small>HABITACIÓN</small><strong>{selected.detalle_reservacion?.[0]?.habitacion?.numero ? `Habitación ${selected.detalle_reservacion[0].habitacion.numero}` : 'Asignación registrada'}</strong></div>
        <div><small>PRECIO POR NOCHE</small><strong>₡{Number(selected.detalle_reservacion?.[0]?.precio_noche || 0).toLocaleString('es-CR')}</strong></div>
        <div><small>OBSERVACIONES</small><strong>{selected.observaciones || 'Sin observaciones.'}</strong></div>
        <div><small>FACTURA</small><strong>{selected.facturas?.find((f) => f.estado === 'emitida') ? 'Disponible' : 'Aún no disponible'}</strong></div>
      </div>
      <div className="modal-actions">
        {editable(selected) && <button className="primary-cta" onClick={() => { setSelected(null); openEdit(selected) }}><Pencil size={15}/> Editar estadía</button>}
        {selected.facturas?.find((f) => f.estado === 'emitida') && <Link className="secondary-cta" to={`/cliente/reservaciones/${selected.id_reservacion}/factura`}><FileText size={15}/> Ver factura</Link>}
      </div>
    </div></div>}

    {editing && <div className="stay-modal-backdrop" onClick={() => !saving && setEditing(null)}><form className="stay-modal edit-modal" onSubmit={save} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="modal-close" onClick={() => !saving && setEditing(null)}><X size={18}/></button>
      <span className="landing-kicker">AJUSTAR TU ESTADÍA</span>
      <h2>Hazla más tuya.</h2>
      <p className="modal-description">Puedes modificar tu entrada, salida y observaciones mientras la estadía siga siendo futura.</p>
      <div className="edit-fields"><label>Entrada<input type="date" min={today()} value={editing.fecha_entrada} onChange={(e) => setEditing({...editing, fecha_entrada:e.target.value})}/></label><label>Salida<input type="date" min={editing.fecha_entrada || today()} value={editing.fecha_salida} onChange={(e) => setEditing({...editing, fecha_salida:e.target.value})}/></label></div>
      <label className="edit-room">Habitación<select value={editing.id_habitacion} onChange={(e) => setEditing({...editing, id_habitacion:e.target.value})}><option value="">Mantener habitación actual</option>{rooms.filter((room) => !['mantenimiento','limpieza'].includes(room.estado)).map((room) => <option key={room.id_habitacion} value={room.id_habitacion}>Habitación {room.numero}</option>)}</select></label>
      <label className="edit-note">Observaciones<textarea rows="4" value={editing.observaciones} onChange={(e) => setEditing({...editing, observaciones:e.target.value})} placeholder="¿Hay algo que quieras que tengamos en cuenta?"/></label>
      {saveError && <div className="save-error">{saveError}</div>}
      <div className="modal-actions"><button type="button" className="secondary-cta" onClick={() => setEditing(null)}>Cancelar</button><button type="submit" className="primary-cta" disabled={saving}>{saving ? 'Guardando...' : <><Check size={15}/> Guardar cambios</>}</button></div>
    </form></div>}
  </div>
}

function StayCard({ item, upcoming, onDetail, onEdit }) {
  const room = item.detalle_reservacion?.[0]?.habitacion
  const image = room?.numero ? `/images/room-${Number(room.numero) % 3 === 0 ? 'garden' : Number(room.numero) % 2 === 0 ? 'suite' : 'essential'}.svg` : '/images/room-suite.svg'
  return <article className={`stay-card ${upcoming ? 'upcoming' : ''}`}>
    <div className="stay-card-image"><img src={image} alt="Habitación Dalssi"/><div className="stay-image-gradient"/><span className="stay-image-tag">{upcoming ? 'Tu próxima escapada' : 'Dalssi · recuerdos'}</span></div>
    <div className="stay-card-body"><div className="stay-card-top"><span>RESERVACIÓN #{item.id_reservacion}</span><span className={`reservation-status status-${item.estado}`}>{labels[item.estado] || item.estado}</span></div><h3>{formatDate(item.fecha_entrada, true)} <em>→</em> {formatDate(item.fecha_salida, true)}</h3><p>{item.observaciones || 'Una estadía para descansar, respirar y volver a ti.'}</p><div className="stay-card-actions"><button onClick={onDetail}>Ver información <ArrowRight size={14}/></button>{upcoming && <button className="edit-link" onClick={onEdit}><Pencil size={13}/> Editar estadía</button>}</div></div>
  </article>
}
