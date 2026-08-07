<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { authStore } from '$lib/stores/authStore';
  import { Routes } from '$lib/constants/routes';
  import { PlaceHolders } from '$lib/constants/placeholders';

  let open = $state(false);

  const links = [
    { to: Routes.MAIN, label: 'Inicio' },
    { to: Routes.STOCK, label: 'Stock' },
    { to: Routes.PRODUCCION, label: 'Producción' },
    { to: Routes.DEFECTOS, label: 'Defectos' },
    { to: Routes.REPORTES, label: 'Reportes' },
    { to: Routes.MANTENIMIENTO, label: 'Mantenimiento' },
    { to: Routes.DIAGRAMAS, label: 'Diagramas' },
    { to: Routes.PEDIDOS, label: 'Pedidos' },
    { to: Routes.ENTREGAS, label: 'Entregas' },
    { to: Routes.AUSENTISMO, label: 'Ausentismo' },
    { to: Routes.LOTES, label: 'Lotes' }
  ];

  const currentPath = $derived(page.url.pathname);

  function goTo(href: string) {
    open = false;
    goto(href);
  }

  async function handleLogout() {
    open = false;
    await authStore.logout();
    goto(Routes.LOGIN);
  }
</script>

<svelte:window
  onclick={(e) => {
    const target = e.target as HTMLElement | null;
    if (open && target && !target.closest('.app-sidebar') && !target.closest('.nav-toggle')) {
      open = false;
    }
  }}
  onkeydown={(e) => {
    if (e.key === 'Escape') open = false;
  }}
/>

<button class="nav-toggle" class:hidden={open} aria-label="Abrir menú" onclick={() => (open = !open)}>
  <span></span>
  <span></span>
  <span></span>
</button>

{#if open}
  <button class="sidebar-backdrop" aria-label="Cerrar menú" onclick={() => (open = false)}></button>
{/if}

<aside class="app-sidebar" class:open>
  <div class="sidebar-header">
    <img src={PlaceHolders.LOGO} alt={PlaceHolders.MECAMBLOCK} />
    <span>{PlaceHolders.MECAMBLOCK}</span>
    <button class="sidebar-close" aria-label="Cerrar menú" onclick={() => (open = false)}>
      &times;
    </button>
  </div>

  <nav class="sidebar-links">
    {#each links as link}
      <button
        class:active={currentPath === link.to}
        onclick={() => goTo(link.to)}
      >
        {link.label}
      </button>
    {/each}
  </nav>

  <div class="sidebar-footer">
    <button class="sidebar-logout" onclick={handleLogout}>
      Cerrar Sesión
    </button>
  </div>
</aside>