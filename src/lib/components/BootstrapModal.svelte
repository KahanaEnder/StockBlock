<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  export let title: string = '';
  export let open: boolean = false;
  export let size: '' | 'modal-sm' | 'modal-lg' | 'modal-xl' = '';
  export let centered: boolean = true;
  export let onCancel: () => void = () => {};

  function handleCancel() {
    open = false;
    onCancel();
  }

  function handleKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') handleCancel();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKey);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKey);
  });
</script>

{#if open}
  <!-- backdrop (estilo bootstrap) -->
    <div 
    class="modal-backdrop fade show" 
    on:click={handleCancel}
    on:keydown={(e) => e.key === 'Escape' && handleCancel()}
    role="button"
    tabindex="0"
  ></div>

  <!-- modal (imitando clases de bootstrap) -->
  <div class="modal d-block fade show" tabindex="-1" role="dialog" aria-modal="true" style="z-index:1050;">
    <div class="modal-dialog {size} {centered ? 'modal-dialog-centered' : ''}" role="document">
      <div class="modal-content" role="document">
        {#if title}
          <div class="modal-header">
            <h5 class="modal-title">{title}</h5>
            <button type="button" class="btn-close" aria-label="Close" on:click={handleCancel}></button>
          </div>
        {/if}

        <div class="modal-body">
          <slot />
        </div>

        <div class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1040;
  }
  .modal.d-block {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
