<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
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

<div class="main-container">
  <div class="card">
    <div class="card-header">
        <h2>📦 Reportar Entrega</h2>
        <p>Seleccione producto y cantidad a entregar.</p>
    </div>

    {#if errorMsg}
      <div class="mensaje error">❌ {errorMsg}</div>
    {/if}
    {#if successMsg}
      <div class="mensaje exito">✅ {successMsg}</div>
    {/if}
    
    <form method="POST" use:enhance={handleSubmit}>
      
      <div class="form-group">
          <label for="prod">Producto</label>
          <select id="prod" bind:value={productoSeleccionado} required>
              <option value={null} disabled selected>-- Seleccione --</option>
              {#each listaProductos as item}
                  <option value={item} disabled={item.cantidad <= 0}>
                      {item.nombre} 
                  </option>
              {/each}
          </select>
          <input type="hidden" name="producto" value={productoSeleccionado?.nombre || ''} />
      </div>

      <div class="form-group">
          <label for="cant">Cantidad a Entregar</label>
          <div class="input-con-info">
              <input 
                type="number" 
                id="cant" 
                name="cantidad" 
                bind:value={cantidadAEnviar} 
                min="1" 
                max={productoSeleccionado ? productoSeleccionado.cantidad : 1}
                disabled={!productoSeleccionado}
                required 
              />
              {#if productoSeleccionado}
                <small>Máx: {productoSeleccionado.cantidad}</small>
              {/if}
          </div>
      </div>

      <div class="form-group">
          <label for="email">Correo Cliente</label>
          <input type="email" name="email" placeholder="cliente@gmail.com" required>
      </div>

      <div class="row">
        <div class="form-group">
            <label for="emp">Empleado</label>
            <input type="text" id="emp" name="nombreEmpleado" required>
        </div>
        <div class="form-group">
            <label for="id">Carnet</label>
            <input type="text" id="id" name="carnet" required>
        </div>
      </div>

      <button type="submit" disabled={cargando || !productoSeleccionado || cantidadAEnviar > productoSeleccionado.cantidad}>
        {#if cargando}
            Procesando...
        {:else}
            Confirmar Entrega
        {/if}
      </button>
    </form>

    <div class="footer-actions">
      <button type="button" class="btn-back btn-lg" onclick={() => goto('/ruta_main')}>
          Volver al menú principal
      </button>
    </div>
  </div>
</div>

<style>
  :global(body) { margin: 0; font-family: 'Segoe UI', sans-serif; background: #f3f4f6; }
  .main-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
  .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 450px; }
  .card-header h2 { margin: 0; color: #1f2937; }
  .card-header p { color: #6b7280; font-size: 0.9rem; margin-bottom: 20px; }
  .form-group { margin-bottom: 1rem; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; font-size: 0.9rem; }
  
  select, input {
    width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; box-sizing: border-box;
  }
  select:focus, input:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

  .input-con-info { position: relative; }
  .input-con-info small {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; color: #555; pointer-events: none;
  }

  button {
    width: 100%; padding: 12px; background-color: #2563eb; color: white; border: none; border-radius: 6px;
    font-weight: bold; cursor: pointer; margin-top: 10px;
  }
  button:hover { background-color: #1d4ed8; }
  button:disabled { background-color: #9ca3af; cursor: not-allowed; }

  .btn-back {
    background: transparent;
    border: 1px solid #d1d5db;
    color: #374151;
    margin-top: 1rem;
  }
  .btn-back:hover { background: #f3f4f6; }

  .mensaje { margin-top: 15px; padding: 10px; border-radius: 6px; text-align: center; }
  .exito { background: #def7ec; color: #03543f; }
  .error { background: #fde8e8; color: #9b1c1c; }
</style>
