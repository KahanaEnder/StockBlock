<script lang="ts">
  export let title = 'Confirmar';
  export let message = '';
  // El padre puede usar bind:open para abrir/cerrar el modal
  export let open = false;
  export let onConfirm: () => void = () => {};
  export let onCancel: () => void = () => {};

  function handleConfirm() {
    onConfirm();
    open = false;
  }
  function handleCancel() {
    onCancel();
    open = false;
  }
</script>

{#if open}
  <!-- backdrop -->
  <div class="modal-backdrop fade show" on:click={handleCancel} />

  <!-- modal (imitando clases bootstrap) -->
  <div class="modal d-block fade show" tabindex="-1" role="dialog" aria-modal="true" style="z-index: 1050;">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{title}</h5>
          <button type="button" class="btn-close" aria-label="Close" on:click={handleCancel}></button>
        </div>
        <div class="modal-body">
          <p>{message}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" on:click={handleCancel}>Cancelar</button>
          <button type="button" class="btn btn-primary" on:click={handleConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Asegura que el backdrop cubra toda la pantalla */
  .modal-backdrop {
    position: fixed;
    inset: 0; /* top:0; right:0; bottom:0; left:0; */
    background: rgba(0,0,0,0.5);
    z-index: 1040;
  }

  /* Si usas bootstrap CSS, .modal/.modal-dialog/.modal-content ya están estiladas */
  /* Este style garantiza comportamiento sin JS de Bootstrap */
  .modal.d-block {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
