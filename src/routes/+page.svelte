<script lang="ts">
  import { goto } from '$app/navigation';

  let { data } = $props();
</script>

<div class="dark-page">
  <div class="error-container">
    <div class="error-card">
      <h1>Acceso Denegado</h1>
      <p>No tienes permiso para acceder a esta página o la sesión expiró.</p>

      <div class="actions">
        <button class="btn-primary-dark" onclick={() => goto('/login')}>
          Ir al Login
        </button>
        <button class="btn-outline-dark" onclick={() => goto('/ruta_main')}>
          Volver al Inicio
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .error-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    border-radius: 2rem;
    padding: 3rem 2.5rem;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.3);
    animation: slideInUp 0.6s ease-out;
  }
  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #ff4d4f;
    margin: 0 0 0.75rem 0;
    letter-spacing: -1px;
  }

  p {
    color: var(--text-secondary);
    font-size: 1rem;
    margin: 0 0 2rem 0;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-primary-dark {
    padding: 0.8rem 1.5rem;
    border-radius: 1rem;
    border: none;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-outline-dark {
    padding: 0.8rem 1.5rem;
    border-radius: 1rem;
    border: 1.5px solid rgba(255, 255, 255, 0.3);
    background: transparent;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-outline-dark:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.5);
  }

  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
