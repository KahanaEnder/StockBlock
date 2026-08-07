<script lang="ts">
  import {Errors} from '$lib/constants/errors'; //Constante para evitar hardcodear
  import {Routes} from '$lib/constants/routes'; //Rutas de GOTOS
  import {PlaceHolders} from '$lib/constants/placeholders'; //Textos
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let isLoading = $state(false);

  async function handleLogin() {
    error = '';
    isLoading = true;

    if (!email.trim() || !password.trim()) { //Verifica campos vacios
      error = Errors.LOGIN_REQUIRED;
      isLoading = false;
      return;
    }

    const success = await authStore.login(email, password);

    if (success) {
      goto(Routes.MAIN);
    } else {
      error = Errors.LOGIN_INVALID;
    }

    isLoading = false;
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<main class="login-container">
  <div class="card-glass">
    <div class="login-header">
      <div class="logo-big">
        <img src={PlaceHolders.LOGO} alt={PlaceHolders.MECAMBLOCK}/>
      </div>
      <h1>{PlaceHolders.MECAMBLOCK}</h1>
      <p>{PlaceHolders.ADMIN}</p>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <div class="error-message" class:shake={!!error} style:visibility={error ? 'visible' : 'hidden'}>
        <span>{error || '\u00A0'}</span>
      </div>

      <div class="form-group">
        <label for="email">{PlaceHolders.EMAIL}</label>
        <input
          id="email"
          type="email"
          placeholder={PlaceHolders.ENTER_EMAIL}
          bind:value={email}
          onkeypress={handleKeyPress}
          disabled={isLoading}
          class="input"
        />
      </div>

      <div class="form-group">
        <label for="password">{PlaceHolders.PASSWORD}</label>
        <input
          id="password"
          type="password"
          placeholder={PlaceHolders.ENTER_PASSWORD}
          bind:value={password}
          onkeypress={handleKeyPress}
          disabled={isLoading}
          class="input"
        />
      </div>

      <button type="submit" disabled={isLoading} class="btn btn-outline-light btn-lg">
        {isLoading ? PlaceHolders.LOGIN_SUCCESS : PlaceHolders.LOGIN}
      </button>
    </form>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  .login-container {
    width: 100%;
    height: 100vh;
    background: var(--background);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo-big {
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-big img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 1rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  }

  .login-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -1px;
  }

  .login-header p {
    font-size: 1rem;
    color: var(--text-primary);
    margin: 1rem 0 0 0;
    font-weight: 600;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group label {
    color: var(--text-primary);
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 1px;
  }

  .input {
    width: 100%;
    padding: 1rem 2rem;
    border-radius: 1rem;
    border: 3px solid var(--glass-border);
    background: rgba(255, 255, 255, 0.12);
    color: var(--text-secondary);
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .input::placeholder {
    color: var(--text-primary);
  }

  .input:focus {
    border-color: var(--glass-border);
    background: var(--glass-border);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  .input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  /* Si la ventana mide menos de 600px se reduce el padding y se amplia el width */
  @media (max-width: 600px) { 
    .card-glass {
      max-width: 95vw;
      padding: 2rem 1.5rem;
    }

    .login-header h1 {
      font-size: 2rem;
    }

    .logo-big {
      width: 150px;
      height: 150px;
    }
  }
</style>
