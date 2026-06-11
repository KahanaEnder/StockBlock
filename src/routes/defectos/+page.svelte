<script lang="ts">
  import { stockStore } from '../../stores/stockStore';
  import { produccionStore } from '../../stores/produccionStore';
  import { defectosStore } from '../../stores/defectosStore';
  import { StockItem } from '$lib/models/stock';
  import { ProductionRecord } from '$lib/models/production';
  import { Defecto } from '$lib/models/defecto';
  import { goto } from '$app/navigation';

  // --- ESTADO ---
  let productoSeleccionado = $state('');
  let errorMsg = $state('');
  let successMsg = $state('');

  // Estado del formulario inline por registro de producción
  let registroActivo = $state<string | number | null>(null);
  let cantDefectuosa = $state(0);
  let descripcionDefecto = $state('');
  let gravedadDefecto = $state<'baja' | 'media' | 'alta'>('baja');

  // --- DATOS REACTIVOS ---
  let productos = $state<StockItem[]>([]);
  stockStore.subscribe(v => { productos = v; });

  let produccion = $state<ProductionRecord[]>([]);
  produccionStore.subscribe(v => { produccion = v; });

  let defectos = $state<Defecto[]>([]);
  defectosStore.subscribe(v => { defectos = v; });

  // --- PRODUCCIÓN DEL PRODUCTO ---
  let produccionDelProducto = $derived(
    productoSeleccionado
      ? produccion.filter(p => p.productoNombre === productoSeleccionado)
      : []
  );

  let totalProducido = $derived(
    produccionDelProducto.reduce((sum, p) => sum + p.cantidad, 0)
  );

  // --- DEFECTOS DEL PRODUCTO ---
  let defectosDelProducto = $derived(
    productoSeleccionado
      ? defectos.filter(d => d.producto === productoSeleccionado)
      : []
  );

  // Cantidad total defectuosa por registro
  function defectuososPorRegistro(produccionId: string | number): number {
    return defectosDelProducto
      .filter(d => String(d.produccionId) === String(produccionId) && d.estado === 'segunda_mano')
      .reduce((sum, d) => {
        const match = d.descripcion.match(/^(\d+)\s*(unid|uds|u|piezas?)?/i);
        return sum + (match ? parseInt(match[1]) : 1);
      }, 0);
  }

  // Defectos por registro
  function defectosPorRegistro(produccionId: string | number): Defecto[] {
    return defectosDelProducto.filter(d => String(d.produccionId) === String(produccionId));
  }

  // --- PRODUCTOS DE SEGUNDA MANO ---
  let segundaMano = $derived(
    defectosDelProducto.filter(d => d.estado === 'segunda_mano')
  );

  // --- SELECCIONAR PRODUCTO ---
  function seleccionarProducto(nombre: string) {
    productoSeleccionado = nombre;
    registroActivo = null;
    cantDefectuosa = 0;
    descripcionDefecto = '';
    errorMsg = '';
    successMsg = '';
  }

  // --- ABRIR FORMULARIO INLINE ---
  function abrirFormulario(regId: string | number) {
    if (registroActivo === regId) {
      registroActivo = null;
      return;
    }
    registroActivo = regId;
    cantDefectuosa = 0;
    descripcionDefecto = '';
    gravedadDefecto = 'baja';
  }

  // --- RESTAR/DEVOLVER STOCK ---
  function ajustarStock(nombreProducto: string, cantidad: number) {
    stockStore.replace(
      item => item.nombre === nombreProducto,
      item => ({
        ...item,
        cantidad: item.cantidad + cantidad,
        fechaModificacion: new Date().toISOString()
      })
    );
  }

  // --- REGISTRAR DEFECTO ---
  async function registrarDefecto(reg: ProductionRecord) {
    errorMsg = '';
    successMsg = '';

    if (cantDefectuosa <= 0) {
      errorMsg = 'La cantidad defectuosa debe ser mayor a 0';
      return;
    }
    if (cantDefectuosa > reg.cantidad) {
      errorMsg = `No puede superar la cantidad producida (${reg.cantidad})`;
      return;
    }
    if (!descripcionDefecto.trim()) {
      errorMsg = 'Describe el defecto';
      return;
    }

    try {
      const desc = `${cantDefectuosa} unidades - ${descripcionDefecto.trim()}`;
      const nuevo = new Defecto(reg.id, productoSeleccionado, desc, gravedadDefecto);
      await defectosStore.add(nuevo);

      // Restar del stock
      ajustarStock(productoSeleccionado, -cantDefectuosa);

      successMsg = `${cantDefectuosa} unidades marcadas como defectuosas (${gravedadDefecto}). Stock ajustado.`;
      registroActivo = null;
      cantDefectuosa = 0;
      descripcionDefecto = '';
    } catch (e: any) {
      errorMsg = `Error: ${e.message || e}`;
    }
  }

  // --- CERRAR DEFECTO (devolver al stock) ---
  function cerrarDefecto(defecto: Defecto) {
    const cantidad = contarCantDefectuosa(defecto.descripcion);

    defectosStore.replace(
      d => String(d.id) === String(defecto.id),
      d => ({ ...d, estado: 'cerrado' as const, fechaModificacion: new Date().toISOString() })
    );

    // Devolver al stock
    ajustarStock(defecto.producto, cantidad);
    successMsg = `${cantidad} unidades devueltas al stock.`;
  }

  function formatearFecha(iso: string) {
    return new Date(iso).toLocaleString('es-CO');
  }

  function contarCantDefectuosa(desc: string): number {
    const match = desc.match(/^(\d+)\s*(unid|uds|u|piezas?)?/i);
    return match ? parseInt(match[1]) : 1;
  }
</script>

<div class="dark-page">
<h1 class="page-title">Defectos / Segunda Mano</h1>

<section class="dark-section">
  {#if errorMsg}
    <div class="msg msg-error">{errorMsg}</div>
  {/if}
  {#if successMsg}
    <div class="msg msg-success">{successMsg}</div>
  {/if}

  <!-- PASO 1: SELECCIONAR PRODUCTO -->
  <div class="card-glass w-full max-w-4xl">
    <h2 class="section-title">Paso 1: Seleccionar Producto</h2>

    {#if productos.length === 0}
      <p class="text-muted-dark">No hay productos en inventario.</p>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {#each productos as prod}
          <button
            class="product-btn"
            class:selected={productoSeleccionado === prod.nombre}
            onclick={() => seleccionarProducto(prod.nombre)}
          >
            <div class="font-bold">{prod.nombre}</div>
            <div class="text-sm opacity-70">{prod.categoria} - Stock: {prod.cantidad}</div>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- PASO 2: PRODUCCIÓN Y REGISTRO DE DEFECTOS -->
  {#if productoSeleccionado}
    <div class="card-glass w-full max-w-4xl">
      <h2 class="section-title">Paso 2: Marcar Defectuosos por Producción</h2>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Total Producido</div>
          <div class="stat-value">{totalProducido}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Registros</div>
          <div class="stat-value">{produccionDelProducto.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Defectos</div>
          <div class="stat-value red">{defectosDelProducto.length}</div>
        </div>
      </div>

      {#if produccionDelProducto.length === 0}
        <p class="text-muted-dark">No hay registros de producción para este producto.</p>
      {:else}
        <div class="overflow-x-auto">
          <table class="styled-table-dark text-sm">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cantidad</th>
                <th>Defectuosos</th>
                <th>Buenos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {#each produccionDelProducto as reg}
                {@const defCant = defectuososPorRegistro(reg.id)}
                {@const defList = defectosPorRegistro(reg.id)}
                <tr>
                  <td>{reg.fechaProduccion}</td>
                  <td class="font-bold">{reg.cantidad}</td>
                  <td class={defCant > 0 ? 'text-red-400 font-bold' : ''}>{defCant}</td>
                  <td class={reg.cantidad - defCant > 0 ? 'text-green-400 font-bold' : ''}>{reg.cantidad - defCant}</td>
                  <td>
                    <button
                      class="action-btn"
                      class:active={registroActivo === reg.id}
                      onclick={() => abrirFormulario(reg.id)}
                    >
                      {registroActivo === reg.id ? 'Cerrar' : 'Marcar defecto'}
                    </button>
                  </td>
                </tr>

                <!-- Formulario inline -->
                {#if registroActivo === reg.id}
                  <tr>
                    <td colspan="5" class="inline-form-cell">
                      <div class="inline-form">
                        <div class="form-row">
                          <div class="form-group-dark">
                            <label for="cant-def-{reg.id}">Cant. Defectuosa (max {reg.cantidad})</label>
                            <input id="cant-def-{reg.id}" type="number" bind:value={cantDefectuosa} min="1" max={reg.cantidad} class="input-dark" />
                          </div>
                          <div class="form-group-dark">
                            <label for="gravedad-{reg.id}">Gravedad</label>
                            <select id="gravedad-{reg.id}" bind:value={gravedadDefecto} class="input-dark">
                              <option value="baja">Baja</option>
                              <option value="media">Media</option>
                              <option value="alta">Alta</option>
                            </select>
                          </div>
                        </div>
                        <div class="form-group-dark">
                          <label for="desc-{reg.id}">Descripción del Defecto</label>
                          <input id="desc-{reg.id}" type="text" bind:value={descripcionDefecto} placeholder="Ej: Grieta en la superficie" class="input-dark" />
                        </div>
                        <button class="btn-primary-dark w-full" onclick={() => registrarDefecto(reg)}>
                          Registrar {cantDefectuosa} Defectuoso(s)
                        </button>
                      </div>
                    </td>
                  </tr>
                {/if}

                <!-- Defectos existentes de este registro -->
                {#if defList.length > 0}
                  <tr>
                    <td colspan="5" class="defect-list-cell">
                      {#each defList as def}
                        <div class="defect-item">
                          <span class="defect-desc">{def.descripcion}</span>
                          <span class="badge {def.gravedad === 'alta' ? 'red' : def.gravedad === 'media' ? 'yellow' : 'gray'}">{def.gravedad}</span>
                          {#if def.estado === 'segunda_mano'}
                            <button class="close-btn" onclick={() => cerrarDefecto(def)}>Devolver</button>
                          {:else}
                            <span class="badge green">Cerrado</span>
                          {/if}
                        </div>
                      {/each}
                    </td>
                  </tr>
                {/if}
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

    <!-- SEGUNDA MANO -->
    {#if segundaMano.length > 0}
      <div class="card-glass w-full max-w-4xl segunda-mano-card">
        <h2 class="section-title blue">Productos de Segunda Mano Disponibles</h2>
        <p class="text-muted-dark text-sm mb-3">Estos productos tienen defectos pero pueden venderse a menor precio.</p>
        <div class="flex flex-wrap gap-2">
          {#each segundaMano as def}
            <div class="segunda-mano-tag">
              <span>{def.descripcion}</span>
              <span class="badge {def.gravedad === 'alta' ? 'red' : def.gravedad === 'media' ? 'yellow' : 'gray'}">{def.gravedad}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

  <div class="volver-container">
    <button class="btn btn-outline-light btn-lg volver-btn" onclick={() => goto('/ruta_main')}>
      Volver al menú principal
    </button>
  </div>
</section>
</div>

<style>
  .msg {
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    width: 100%;
    max-width: 48rem;
    text-align: center;
  }
  .msg-error { background: rgba(255, 77, 79, 0.15); color: #ff4d4f; border: 1px solid #ff4d4f; }
  .msg-success { background: rgba(76, 175, 80, 0.15); color: #4caf50; border: 1px solid #4caf50; }

  .section-title {
    color: var(--accent-blue);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .section-title.blue { color: #60a5fa; }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 0.75rem;
    text-align: center;
  }
  .stat-label { color: var(--text-tertiary); font-size: 0.75rem; margin-bottom: 0.2rem; }
  .stat-value { color: white; font-size: 1.4rem; font-weight: 800; }
  .stat-value.red { color: #f87171; }

  .product-btn {
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }
  .product-btn:hover { background: rgba(255, 255, 255, 0.1); }
  .product-btn.selected {
    background: var(--accent-blue);
    border-color: var(--accent-blue);
    color: white;
  }

  .action-btn {
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    border: 1px solid var(--accent-blue);
    background: transparent;
    color: var(--accent-blue);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .action-btn:hover { background: rgba(118, 169, 250, 0.15); }
  .action-btn.active { background: var(--accent-blue); color: white; }

  .inline-form-cell {
    padding: 0 !important;
    border-bottom: 1px solid rgba(79, 131, 247, 0.2) !important;
  }
  .inline-form {
    padding: 1rem;
    background: rgba(79, 131, 247, 0.08);
    border-radius: 0.5rem;
    margin: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .form-group-dark {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .form-group-dark label {
    color: var(--accent-blue);
    font-weight: 600;
    font-size: 0.8rem;
  }
  .input-dark {
    width: 100%;
    padding: 0.6rem 0.8rem;
    border-radius: 0.5rem;
    border: 1px solid var(--accent-blue);
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 0.95rem;
    outline: none;
    box-sizing: border-box;
  }
  .input-dark:focus { border: 2px solid var(--accent-blue); background: rgba(255, 255, 255, 0.12); }
  .input-dark::placeholder { color: rgba(255, 255, 255, 0.4); }

  .defect-list-cell {
    padding: 0.5rem 1rem !important;
    background: rgba(255, 255, 255, 0.03);
  }
  .defect-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0;
    font-size: 0.85rem;
  }
  .defect-desc { color: white; flex: 1; }
  .close-btn {
    padding: 0.2rem 0.5rem;
    border-radius: 0.3rem;
    border: 1px solid rgba(248, 113, 113, 0.4);
    background: transparent;
    color: #f87171;
    font-size: 0.7rem;
    cursor: pointer;
  }
  .close-btn:hover { background: rgba(248, 113, 113, 0.15); }

  .badge {
    padding: 0.15rem 0.4rem;
    border-radius: 0.3rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
  }
  .badge.red { background: rgba(248, 113, 113, 0.2); color: #f87171; }
  .badge.yellow { background: rgba(250, 204, 21, 0.2); color: #facc15; }
  .badge.gray { background: rgba(156, 163, 175, 0.2); color: #9ca3af; }
  .badge.green { background: rgba(74, 222, 128, 0.2); color: #4ade80; }

  .segunda-mano-card {
    border: 1px solid rgba(96, 165, 250, 0.3);
    background: rgba(96, 165, 250, 0.08);
  }
  .segunda-mano-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(96, 165, 250, 0.15);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 2rem;
    color: #93c5fd;
    font-size: 0.85rem;
  }

  .text-muted-dark { color: var(--text-tertiary); }
  .font-bold { font-weight: 700; }
  .text-red-400 { color: #f87171; }
  .text-green-400 { color: #4ade80; }
</style>
