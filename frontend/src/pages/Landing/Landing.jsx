import { Link } from 'react-router-dom'
import { ArrowRight, BedDouble, Coffee, Heart, MapPin, Sparkles, Star } from 'lucide-react'
import './Landing.css'

const rooms = [
  {
    title: 'Habitación Esencial',
    text: 'Un espacio tranquilo para descansar y desconectarte.',
    price: 'Desde ₡45.000 / noche',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Suite Dalssi',
    text: 'Más amplitud, más calma y pequeños detalles para sentirte en casa.',
    price: 'Desde ₡68.000 / noche',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Suite Jardín',
    text: 'Una estadía luminosa rodeada de una atmósfera cálida y natural.',
    price: 'Desde ₡82.000 / noche',
    image: 'https://images.unsplash.com/photo-1601918774946-25832a4b7d2e?auto=format&fit=crop&w=1200&q=85',
  },
]

const galleryImages = {
  hero: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1500&q=85',
  story: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85',
}

export default function Landing() {
  return <div className="landing-page">
    <header className="landing-nav">
      <Link to="/" className="landing-brand">
        <img src="/logo/dalssi-isotipo.png" alt="Dalssi" />
        <div><strong>DALSSI</strong><span>HOTEL</span></div>
      </Link>

      <nav>
        <a href="#habitaciones">Habitaciones</a>
        <a href="#experiencia">Experiencia</a>
        <a href="#hotel">Nuestro hotel</a>
        <a href="#contacto">Contacto</a>
      </nav>

      <div className="landing-nav-actions">
        <Link to="/login" className="landing-login">Iniciar sesión</Link>
        <Link to="/register" className="landing-book">Reservar ahora <ArrowRight size={16}/></Link>
      </div>
    </header>

    <main>
      <section className="landing-hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-copy">
          <span className="landing-kicker"><Sparkles size={14}/> UNA PAUSA QUE SE SIENTE</span>
          <h1>Tu lugar para <em>desconectar</em> y volver a ti.</h1>
          <p>En Dalssi creamos estadías cálidas, tranquilas y especiales para que descansar se sienta como llegar a casa.</p>

          <div className="hero-actions">
            <Link to="/register" className="primary-cta">Quiero conocer Dalssi <ArrowRight size={18}/></Link>
            <a href="#experiencia" className="text-cta">Descubrir el hotel</a>
          </div>

          <div className="hero-note">
            <Star size={14} fill="currentColor"/> Una experiencia pensada para quedarse en la memoria.
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-photo">
            <img src={galleryImages.hero} alt="Interior acogedor de Dalssi Hotel" />
            <div className="hero-photo-overlay" />
            <div className="hero-photo-top"><span>DALSSI</span><span>ESTADÍA</span></div>
            <div className="hero-photo-content">
              <BedDouble size={48} strokeWidth={1.15}/>
              <span>SUITE DALSSI</span>
              <strong>Un refugio para ti</strong>
            </div>
            <div className="hero-photo-bottom"><span>Descanso · Calma · Hogar</span><span>♡</span></div>
          </div>

          <div className="floating-card floating-card-one">
            <Heart size={16}/>
            <div><strong>Detalles que importan</strong><span>Calidez en cada rincón</span></div>
          </div>

          <div className="floating-card floating-card-two">
            <MapPin size={16}/>
            <div><strong>Tu próxima escapada</strong><span>Empieza aquí</span></div>
          </div>
        </div>
      </section>

      <section className="landing-intro" id="experiencia">
        <div>
          <span className="landing-kicker">LA EXPERIENCIA DALSSI</span>
          <h2>No es solo dónde duermes.<br/><em>Es cómo te sientes.</em></h2>
        </div>
        <p>Queremos que desde el primer momento sientas que puedes bajar el ritmo. Espacios acogedores, atención cercana y todo lo necesario para disfrutar sin complicaciones.</p>
      </section>

      <section className="landing-rooms" id="habitaciones">
        <div className="section-heading">
          <div>
            <span className="landing-kicker">HABITACIONES</span>
            <h2>Encuentra tu espacio.</h2>
          </div>
          <Link to="/login" className="outline-cta">Ver disponibilidad <ArrowRight size={16}/></Link>
        </div>

        <div className="room-grid">
          {rooms.map((room, index) => (
            <article className="landing-room" key={room.title}>
              <div className="room-art">
                <img src={room.image} alt={room.title} />
                <div className="room-image-overlay" />
                <span>DALSSI</span>
                <div className="room-icon"><BedDouble size={38} strokeWidth={1.15}/></div>
              </div>

              <div className="room-content">
                <span className="room-type">{index === 1 ? 'PARA ESCAPADAS ESPECIALES' : 'PARA DESCANSAR'}</span>
                <h3>{room.title}</h3>
                <p>{room.text}</p>
                <div className="room-footer">
                  <span>{room.price}</span>
                  <Link to="/register">Conocer <ArrowRight size={15}/></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-story" id="hotel">
        <div className="story-visual">
          <div className="story-image-wrap">
            <img src={galleryImages.story} alt="Espacio de descanso de Dalssi Hotel" />
            <div className="story-image-overlay" />
            <div className="story-badge"><Coffee size={24}/><span>DALSSI</span></div>
          </div>
        </div>

        <div className="story-copy">
          <span className="landing-kicker">NUESTRO HOTEL</span>
          <h2>Un pequeño lujo:<br/><em>sentirte en casa.</em></h2>
          <p>Dalssi nace de una idea sencilla: una buena estadía no necesita sentirse complicada. Queremos combinar lo bonito con lo cómodo, y la atención con esos detalles que hacen que quieras quedarte un poco más.</p>
          <div className="story-points">
            <span>01 · Atención cercana</span>
            <span>02 · Espacios para respirar</span>
            <span>03 · Momentos para recordar</span>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <span className="landing-kicker">CUANDO QUIERAS ESCAPAR</span>
        <h2>Tu próxima historia puede empezar aquí.</h2>
        <p>Conoce Dalssi, encuentra tu habitación y déjanos preparar el resto.</p>
        <Link to="/register" className="primary-cta">Comenzar mi estadía <ArrowRight size={18}/></Link>
      </section>
    </main>

    <footer className="landing-footer" id="contacto">
      <div className="landing-brand">
        <img src="/logo/dalssi-isotipo.png" alt="" />
        <div><strong>DALSSI</strong><span>HOTEL</span></div>
      </div>
      <div><span>Una experiencia de descanso y bienestar.</span><small>© 2026 Dalssi Hotel</small></div>
    </footer>
  </div>
}
