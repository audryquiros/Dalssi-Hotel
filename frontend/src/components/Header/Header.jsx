import { useMemo, useState } from 'react'
import { Bell, Search, X, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Header.css'

const sections = [
  { label: 'Panel principal', path: '/' },
  { label: 'Reservaciones', path: '/reservaciones' },
  { label: 'Habitaciones', path: '/habitaciones' },
  { label: 'Clientes', path: '/clientes' },
  { label: 'Huéspedes', path: '/huespedes' },
  { label: 'Servicios', path: '/servicios' },
  { label: 'Pagos', path: '/pagos' },
  { label: 'Facturas', path: '/facturas' },
  { label: 'Empleados', path: '/empleados' },
]

const initialNotifications = [
  { id: 1, title: 'Bienvenido a Dalssi', message: 'El panel está listo para gestionar el hotel.', time: 'Ahora', read: false },
  { id: 2, title: 'Recordatorio', message: 'Revisa las reservaciones próximas desde el menú.', time: 'Hoy', read: false },
]

export default function Header({ title, subtitle }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)

  const results = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('es')
    if (!term) return []
    return sections.filter((section) => section.label.toLocaleLowerCase('es').includes(term))
  }, [searchTerm])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const markAllAsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <span className="eyebrow">DALSSI HOTEL</span>
        <h1>{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>

      <div className="topbar-actions">
        <div className={`search-area ${searchOpen ? 'is-open' : ''}`}>
          {searchOpen && (
            <div className="search-field-wrap">
              <Search size={16} />
              <input
                autoFocus
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar secciones..."
                aria-label="Buscar secciones"
              />
              <button className="search-close" onClick={() => { setSearchOpen(false); setSearchTerm('') }} aria-label="Cerrar búsqueda">
                <X size={16} />
              </button>
              {searchTerm.trim() && (
                <div className="search-results">
                  {results.length ? results.map((result) => (
                    <Link key={result.path} to={result.path} onClick={() => { setSearchOpen(false); setSearchTerm('') }}>
                      <Search size={14} /> {result.label}
                    </Link>
                  )) : <p>No se encontraron secciones.</p>}
                </div>
              )}
            </div>
          )}
          {!searchOpen && <button className="icon-button" onClick={() => { setSearchOpen(true); setNotificationsOpen(false) }} aria-label="Abrir búsqueda"><Search size={18} /></button>}
        </div>

        <div className="notification-area">
          <button
            className="icon-button notification-button"
            onClick={() => { setNotificationsOpen((open) => !open); setSearchOpen(false) }}
            aria-label={`Notificaciones${unreadCount ? `, ${unreadCount} sin leer` : ''}`}
            aria-expanded={notificationsOpen}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
          </button>
          {notificationsOpen && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <div><strong>Notificaciones</strong><span>{unreadCount ? `${unreadCount} sin leer` : 'Todo al día'}</span></div>
                <button onClick={markAllAsRead} disabled={!unreadCount} aria-label="Marcar todas como leídas" title="Marcar todas como leídas"><CheckCheck size={16} /></button>
              </div>
              <div className="notification-list">
                {notifications.map((notification) => (
                  <article className={`notification-item ${notification.read ? 'is-read' : ''}`} key={notification.id}>
                    <span className="notification-dot" />
                    <div><strong>{notification.title}</strong><p>{notification.message}</p><small>{notification.time}</small></div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
