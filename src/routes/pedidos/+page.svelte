<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { Routes } from '$lib/constants/routes';
  import { stockStore } from '$lib/stores/stockStore';
  import { StockItem } from '$lib/models/stock';
  
  let { form } = $props();
  
  let cargando = $state(false);
  let listaProductos = $state<StockItem[]>([]);
  let productoSeleccionado = $state<StockItem | null>(null);
  let cantidadAEnviar: number = $state(1);
  let errorMsg = $state('');
  let successMsg = $state('');

  stockStore.subscribe(v => { listaProductos = v; });

  $effect(() => {
    if (productoSeleccionado) {
      cantidadAEnviar = 1;
    }
  });

  $effect(() => {
    if (form?.success) {
      successMsg = 'Entrega registrada y stock actualizado.';
      errorMsg = '';
    }
    if (form?.error) {
      errorMsg = form.error;
      successMsg = '';
    }
  });

  const handleSubmit = () => {
    if (!productoSeleccionado || cantidadAEnviar <= 0) return ({ cancel }: any) => cancel();
    
    if (cantidadAEnviar > productoSeleccionado.cantidad) {
        errorMsg = `Solo tienes ${productoSeleccionado.cantidad} unidades disponibles.`;
        successMsg = '';
        return ({ cancel }: any) => cancel();
    }

    cargando = true;

    return async ({ result, update }: any) => {
        await update(); 
        cargando = false;

        if (result.type === 'success') {
            descontarStock();
        }
    };
  };

  function descontarStock() {
    if (!productoSeleccionado) return;

    stockStore.replace(
      p => p.id === productoSeleccionado!.id,
      p => ({
        ...p,
        cantidad: p.cantidad - cantidadAEnviar,
        fechaModificacion: new Date().toISOString()
      })
    );
    
    productoSeleccionado = null;
    cantidadAEnviar = 1;
  }
</script>

<div class="main-container dark-page">
  <div class="card-glass">
    <div class="card-header">
        <h2>📦 Reportar Entrega</h2>
        <p>Seleccione producto y cantidad a entregar.</p>
    </div>

    {#if errorMsg}
      <div class="msg msg-error">❌ {errorMsg}</div>
    {/if}
    {#if successMsg}
      <div class="msg msg-success">✅ {successMsg}</div>
    {/if}
    
    <form method="POST" use:enhance={handleSubmit}>
      
      <div class="form-group-dark">
          <label for="prod">Producto</label>
          <select id="prod" class="input-dark" bind:value={productoSeleccionado} required>
              <option value={null} disabled selected>-- Seleccione --</option>
              {#each listaProductos as item}
                  <option value={item} disabled={item.cantidad <= 0}>
                      {item.nombre} 
                  </option>
              {/each}
          </select>
          <input type="hidden" name="producto" value={productoSeleccionado?.nombre || ''} />
      </div>

      <div class="form-group-dark">
          <label for="cant">Cantidad a Entregar</label>
          <div class="input-con-info">
              <input 
                type="number" 
                class="input-dark"
                id="cant" 
                name="cantidad" 
                bind:value={cantidadAEnviar} 
                min="1" 
                max={productoSeleccionado ? productoSeleccionado.cantidad : 1}
                disabled={!productoSeleccionado}
                required 
              />
              {#if productoSeleccionado}
                <small class="max-hint">Máx: {productoSeleccionado.cantidad}</small>
              {/if}
          </div>
      </div>

      <div class="form-group-dark">
          <label for="email">Correo Cliente</label>
          <input type="email" class="input-dark" name="email" placeholder="cliente@gmail.com" required>
      </div>

      <div class="row">
        <div class="form-group-dark">
            <label for="emp">Empleado</label>
            <input type="text" class="input-dark" id="emp" name="nombreEmpleado" required>
        </div>
        <div class="form-group-dark">
            <label for="id">Carnet</label>
            <input type="text" class="input-dark" id="id" name="carnet" required>
        </div>
      </div>

      <button type="submit" class="btn btn-primary-dark btn-lg" disabled={cargando || !productoSeleccionado || cantidadAEnviar > productoSeleccionado.cantidad}>
        {#if cargando}
            Procesando...
        {:else}
            Confirmar Entrega
        {/if}
      </button>
    </form>

    <div class="volver-container">
      <button type="button" class="btn btn-outline-light btn-lg volver-btn" onclick={() => goto(Routes.MAIN)}>
          Volver al menú principal
      </button>
    </div>
  </div>
</div>

<style>
  .main-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; box-sizing: border-box; }
  .card-glass { max-width: 450px; display: flex; flex-direction: column; gap: 1rem; }
  .card-header h2 { margin: 0; color: #fff; }
  .card-header p { color: #76a9fa; font-size: 0.9rem; margin: 0.25rem 0 0; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .input-dark { max-width: 100%; }
  .input-con-info { position: relative; }
  .max-hint {
    color: var(--text-tertiary);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
