import { Link } from 'react-router-dom'
import { ArrowRight, BedDouble, CalendarDays, Heart, LogOut, MapPin, Sparkles, Star, UserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import './ClientHome.css'

const rooms = [
  {
    title: 'Habitación Esencial',
    eyebrow: 'HABITACIÓN ESENCIAL',
    description: 'Todo lo necesario para una pausa tranquila, cómoda y sin complicaciones.',
    image: '/images/room-essential.svg',
    tag: 'Calma'
  },
  {
    title: 'Suite Dalssi',
    eyebrow: 'SUITE DALSSI',
    description: 'Más amplitud, luz suave y pequeños detalles pensados para quedarse.',
    image: '/images/room-suite.svg',
    tag: 'Favorita'
  },
  {
    title: 'Suite Jardín',
    eyebrow: 'SUITE JARDÍN',
    description: 'Una atmósfera luminosa y natural para respirar un poco más despacio.',
    image: '/images/room-garden.svg',
    tag: 'Naturaleza'
  }
]

export default function ClientHome() {
  const { user, logout } = useAuth()
  const name = user?.nombre || 'te'
  const initials = `${user?.nombre?.[0] || ''}${user?.apellidos?.[0] || ''}`.trim() || 'D'

  return <div className="client-site">
    <header className="client-nav">
      <Link to="/cliente" className="landing-brand">
        <img src="/logo/dalssi-isotipo.png" alt="Dalssi" />
        <div><strong>DALSSI</strong><span>HOTEL</span></div>
      </Link>

      <nav>
        <Link to="/cliente" className="active">Inicio</Link>
        <Link to="/cliente/reservaciones">Mi estadía</Link>
        <a href="#habitaciones">Habitaciones</a>
        <a href="#experiencia">Experiencia</a>
      </nav>

      <div className="client-account">
        <Link to="/cliente/perfil" className="client-profile-link" title="Mi perfil">
          <span className="client-avatar">{initials.toUpperCase()}</span>
          <span className="client-profile-name">{name}</span>
        </Link>
        <button className="client-logout" onClick={logout} title="Cerrar sesión">
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </header>

    <main>
      <section className="client-hero">
        <div className="client-hero-orb orb-one" />
        <div className="client-hero-orb orb-two" />
        <div className="client-hero-copy">
          <span className="landing-kicker"><Sparkles size={14}/> QUÉ BONITO TENERTE DE VUELTA</span>
          <h1>Hola, {name}.<br/><em>Tu lugar te espera.</em></h1>
          <p>Vuelve a bajar el ritmo, descubre nuevas experiencias y disfruta Dalssi a tu manera.</p>
          <div className="client-actions">
            <Link to="/cliente/reservaciones" className="primary-cta">Ver mis reservaciones <ArrowRight size={17}/></Link>
            <a href="#habitaciones" className="text-cta">Explorar habitaciones</a>
          </div>
          <div className="client-hero-note"><Heart size={14}/> Un espacio pensado para volver a ti.</div>
        </div>

        <div className="client-hero-visual">
          <div className="client-hero-image">
            <img src="/images/dalssi-experience.svg" alt="Hotel Dalssi" />
            <div className="client-image-overlay" />
            <div className="client-image-copy">
              <span>DALSSI · HOTEL</span>
              <Heart size={27} />
              <strong>Cuando quieras<br/>sentirte en casa.</strong>
              <small>Descanso · Calma · Hogar</small>
            </div>
          </div>
          <div className="floating-note note-top"><Sparkles size={14}/><span>Pequeños detalles<br/><b>para ti.</b></span></div>
          <div className="floating-note note-bottom"><MapPin size={14}/><span>Un lugar para<br/><b>desconectar.</b></span></div>
        </div>
      </section>

      <section className="client-features">
        <article><CalendarDays size={22}/><div><strong>Tu estadía</strong><span>Consulta tus próximas reservaciones.</span></div><Link to="/cliente/reservaciones"><ArrowRight size={15}/></Link></article>
        <article><BedDouble size={22}/><div><strong>Descubre habitaciones</strong><span>Encuentra el espacio que más se parece a ti.</span></div><a href="#habitaciones"><ArrowRight size={15}/></a></article>
        <article><Heart size={22}/><div><strong>Momentos Dalssi</strong><span>Pequeños detalles para disfrutar tu visita.</span></div><a href="#experiencia"><ArrowRight size={15}/></a></article>
      </section>

      <section className="client-section rooms-section" id="habitaciones">
        <div className="client-section-heading">
          <span className="landing-kicker">PARA TU PRÓXIMA ESCAPADA</span>
          <h2>Encuentra tu espacio.</h2>
          <p>Habitaciones pensadas para descansar bonito.</p>
        </div>
        <div className="client-room-cards">
          {rooms.map((room, index) => <article className={`client-room-card ${index === 1 ? 'featured' : ''}`} key={room.title}>
            <div className="client-room-image">
              <img src={room.image} alt={room.title}/>
              <span className="room-tag">{room.tag}</span>
              <div className="room-image-shade" />
            </div>
            <div className="client-room-content">
              <span>{room.eyebrow}</span>
              <h3>{room.title}</h3>
              <p>{room.description}</p>
              <a href="#experiencia" className="room-link">Conocer más <ArrowRight size={14}/></a>
            </div>
          </article>)}
        </div>
      </section>

      <section className="client-experience" id="experiencia">
        <div className="experience-image">
          <img src="/images/dalssi-experience.svg" alt="Interior de Dalssi Hotel" />
          <div className="experience-image-badge"><Star size={15}/> La experiencia Dalssi</div>
        </div>
        <div className="experience-copy">
          <span className="landing-kicker">LA EXPERIENCIA DALSSI</span>
          <h2>Un lugar bonito para <em>sentirte en casa.</em></h2>
          <p>Queremos que cada visita tenga algo que recordar: una habitación que te haga respirar, una atención cercana y esos pequeños detalles que hacen que quieras volver.</p>
          <div className="experience-points">
            <span><i>01</i> Atención cercana</span>
            <span><i>02</i> Espacios para respirar</span>
            <span><i>03</i> Momentos para recordar</span>
          </div>
        </div>
      </section>

      <section className="client-quote">
        <span className="landing-kicker">UN PEQUEÑO RECORDATORIO</span>
        <blockquote>“Hay lugares a los que vas. Y hay lugares a los que <em>quieres volver.</em>”</blockquote>
        <p>Queremos que Dalssi sea de los segundos.</p>
        <Link to="/cliente/perfil" className="profile-cta"><UserRound size={16}/> Ver mi perfil</Link>
      </section>
    </main>

    <footer className="client-footer">
      <div className="landing-brand"><img src="/logo/dalssi-isotipo.png" alt=""/><div><strong>DALSSI</strong><span>HOTEL</span></div></div>
      <div><span>Tu lugar para desconectar.</span><small>© 2026 Dalssi Hotel</small></div>
    </footer>
  </div>
}
