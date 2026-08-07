<script lang="ts">
  import { PlaceHolders } from '$lib/constants/placeholders';
</script>

<main class="dark-page info-page">
  <section class="hero">
    <div class="hero-bg-animation">
      <div class="particles">
        {#each Array(10) as _}
          <span class="particle"></span>
        {/each}
      </div>
    </div>

    <div class="hero-content">
      <div class="logo-big">
        <img src={PlaceHolders.LOGO} alt={PlaceHolders.MECAMBLOCK} />
      </div>
      <h1>{PlaceHolders.MECAMBLOCK}</h1>
      <p class="hero-subtitle">Sistema de gestión integral de producción, stock y calidad</p>
    </div>
  </section>

  <section class="info-section">
    <h2 class="page-title">Cómo usar la aplicación</h2>
    <p class="info-lead">Usa el menú lateral para navegar entre los módulos del sistema:</p>

    <div class="info-grid">
      <div class="card-glass info-card">
        <h3>Stock</h3>
        <p>Gestiona el inventario de productos y sus cantidades.</p>
      </div>
      <div class="card-glass info-card">
        <h3>Producción</h3>
        <p>Registra la producción diaria por producto.</p>
      </div>
      <div class="card-glass info-card">
        <h3>Defectos</h3>
        <p>Control de defectos y artículos de segunda mano.</p>
      </div>
      <div class="card-glass info-card">
        <h3>Reportes</h3>
        <p>Consulta reportes mensuales con métricas del negocio.</p>
      </div>
      <div class="card-glass info-card">
        <h3>Mantenimiento</h3>
        <p>Registro de mantenimientos de la maquinaria.</p>
      </div>
      <div class="card-glass info-card">
        <h3>Diagramas</h3>
        <p>Visualiza datos y análisis con gráficos.</p>
      </div>
      <div class="card-glass info-card">
        <h3>Pedidos</h3>
        <p>Notifica pedidos de productos.</p>
      </div>
      <div class="card-glass info-card">
        <h3>Entregas</h3>
        <p>Registra entregas con firma del cliente.</p>
      </div>
      <div class="card-glass info-card">
        <h3>Ausentismo</h3>
        <p>Control de ausentismo de operarios.</p>
      </div>
      <div class="card-glass info-card">
        <h3>Lotes</h3>
        <p>Administración de lotes de producción.</p>
      </div>
    </div>
  </section>

  <section class="info-section">
    <h2 class="page-title">Sobre la empresa</h2>
    <div class="card-glass info-company">
      <h3>H.V. MecamBlock CIA S.A.S</h3>
      <p>Empresa dedicada a la fabricación de bloques y productos de concreto.</p>
    </div>
  </section>

  <footer class="glass-footer">
    <div class="footer-bottom">
      <p class="footer-copyright">© 2025 H.V. MecamBlock CIA S.A.S</p>
    </div>
  </footer>
</main>

<style>
  .info-page {
    overflow-x: hidden;
    line-height: 1.6;
  }

  /* Hero */
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 120px 2rem 0;
    position: relative;
    overflow: hidden;
  }

  .hero-bg-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: 1;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 25% 25%, var(--accent-glow) 0%, transparent 50%);
    animation: hero-glow 8s ease-in-out infinite;
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 1000px;
    margin: 0 auto;
  }

  .logo-big {
    width: 140px;
    height: 140px;
    margin-bottom: 1.5rem;
  }

  .logo-big img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .hero h1 {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 800;
    margin-bottom: 1rem;
    color: var(--text-primary);
    line-height: 1.1;
    letter-spacing: -2px;
    animation: slideInUp 1s ease-out;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: var(--text-tertiary);
    max-width: 600px;
    animation: slideInUp 1s ease-out 0.3s both;
  }

  .particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: radial-gradient(666px at 0.4% 48%, rgb(202, 204, 227) 0%, rgb(89, 89, 99) 97.5%);
    border-radius: 50%;
    opacity: 0;
    animation: particle-rise 10s infinite ease-out;
  }

  .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
  .particle:nth-child(2) { left: 20%; animation-delay: 1s; }
  .particle:nth-child(3) { left: 30%; animation-delay: 2s; }
  .particle:nth-child(4) { left: 40%; animation-delay: 3s; }
  .particle:nth-child(5) { left: 50%; animation-delay: 4s; }
  .particle:nth-child(6) { left: 60%; animation-delay: 5s; }
  .particle:nth-child(7) { left: 70%; animation-delay: 6s; }
  .particle:nth-child(8) { left: 80%; animation-delay: 7s; }
  .particle:nth-child(9) { left: 90%; animation-delay: 8s; }
  .particle:nth-child(10) { left: 95%; animation-delay: 9s; }

  /* Info sections */
  .info-section {
    padding: 3rem 2rem 4rem;
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
  }

  .info-lead {
    text-align: center;
    color: var(--text-tertiary);
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
  }

  .info-card {
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .info-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(31, 38, 135, 0.3);
  }

  .info-card h3 {
    color: var(--accent-blue);
    font-size: 1.1rem;
    margin: 0 0 0.5rem;
  }

  .info-card p {
    color: var(--text-tertiary);
    margin: 0;
    font-size: 0.95rem;
  }

  .info-company {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding: 2rem;
  }

  .info-company h3 {
    color: var(--accent-blue);
    margin: 0 0 0.5rem;
  }

  .info-company p {
    color: var(--text-tertiary);
    margin: 0;
  }

  /* Footer */
  .footer-bottom {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .footer-copyright {
    color: var(--text-tertiary);
    font-size: 0.9rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .hero {
      padding: 100px 1.5rem 0;
    }

    .info-section {
      padding: 2rem 1.25rem 3rem;
    }
  }
</style>