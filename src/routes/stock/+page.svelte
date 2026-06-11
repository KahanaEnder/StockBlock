<script lang="ts">
    import { StockItem } from '$lib/models/stock';
    import { stockStore } from '../../stores/stockStore';
    import { goto } from '$app/navigation';

    // --- ESTADO PRINCIPAL ---
    let inventario: StockItem[] = [];
    let errorMsg = '';

    stockStore.subscribe(value => { inventario = value; });

    // --- ESTADO DEL FORMULARIO Y EDICIÓN ---
    let modoEdicion = false;
    let idEdicion: string | number | null = null;

    let nuevoNombre = '';
    let nuevaCantidad = 0;
    let nuevaCategoria = '';
    let nuevoMinimo = 5;

    // --- ESTADO DE FILTROS (HU04) ---
    let busqueda = '';
    let categoriaFiltro = 'Todas';

    // --- LÓGICA HU04 (Filtros) ---
    $: categoriasDisponibles = ['Todas', ...new Set(inventario.map(i => i.categoria).filter(c => c))];

    $: productosVisibles = inventario.filter(item => {
        const nombreMatch = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const catMatch = categoriaFiltro === 'Todas' || item.categoria === categoriaFiltro;
        return nombreMatch && catMatch;
    });

    // --- UTILIDADES DE FECHA ---
    function formatearFecha(isoString: string | null): string {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleDateString('es-CO', { 
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
        });
    }

    // --- ACCIONES DE GESTIÓN ---

    // 1. Función Inteligente: Sirve para CREAR y para EDITAR
    async function gestionarProducto() {
        if (!nuevoNombre.trim()) return;
        const catFinal = nuevaCategoria.trim() === '' ? 'General' : nuevaCategoria;
        errorMsg = '';

        try {
            if (modoEdicion && idEdicion !== null) {
                stockStore.replace(item => String(item.id) === String(idEdicion), item => ({
                    ...item,
                    nombre: nuevoNombre,
                    cantidad: nuevaCantidad,
                    categoria: catFinal,
                    stockMinimo: nuevoMinimo,
                    fechaModificacion: new Date().toISOString()
                }));
                cancelarEdicion();
            } else {
                const nuevoItem = new StockItem(nuevoNombre, nuevaCantidad, catFinal, nuevoMinimo);
                await stockStore.add(nuevoItem);
                limpiarFormulario();
            }
        } catch (e: any) {
            errorMsg = `Error guardando: ${e.message || e}`;
            console.error('Error en gestionarProducto:', e);
        }
    }

    // 2. Cargar datos en el formulario para editar
    function iniciarEdicion(item: StockItem) {
        nuevoNombre = item.nombre;
        nuevaCantidad = item.cantidad;
        nuevaCategoria = item.categoria;
        nuevoMinimo = item.stockMinimo;
        
        idEdicion = item.id;
        modoEdicion = true;
        
        // Scroll suave hacia arriba para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 3. Cancelar edición
    function cancelarEdicion() {
        modoEdicion = false;
        idEdicion = null;
        limpiarFormulario();
    }

    function limpiarFormulario() {
        nuevoNombre = '';
        nuevaCantidad = 0;
        nuevaCategoria = '';
        nuevoMinimo = 5;
    }

    function eliminarProducto(id: string | number) {
        if(confirm('¿Borrar producto permanentemente?')) {
            try {
                stockStore.remove(item => String(item.id) === String(id));
                if (String(idEdicion) === String(id)) cancelarEdicion();
            } catch (e: any) {
                errorMsg = `Error eliminando: ${e.message || e}`;
            }
        }
    }
</script>

<div class="container">
    <header>
        <h1>📦 Gestión de Stock</h1>
    </header>

    {#if errorMsg}
        <div style="background: #ff4d4f22; color: #ff4d4f; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #ff4d4f;">
            ⚠️ {errorMsg}
        </div>
    {/if}

    <section class="panel form-panel" class:editing-mode={modoEdicion}>
        <div class="form-header">
            <h3>{modoEdicion ? '✏️ Editando Producto' : '➕ Registrar Nuevo Producto'}</h3>
            {#if modoEdicion}
                <button class="btn-cancel-top" onclick={cancelarEdicion}>Cancelar</button>
            {/if}
        </div>

        <div class="form-row">
            <input type="text" placeholder="Nombre (ej. Arena)" bind:value={nuevoNombre} />
            
            <input type="text" placeholder="Categoría" list="lista-cat" bind:value={nuevaCategoria} />
            <datalist id="lista-cat">
                <option value="Materiales"></option>
                <option value="Herramientas"></option>
            </datalist>

            <div class="input-small">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="lbl-tiny">Cant.</label>
                <input type="number" bind:value={nuevaCantidad} />
            </div>
            
            <div class="input-small">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="lbl-tiny">Mín.</label>
                <input type="number" bind:value={nuevoMinimo} title="Stock Mínimo" />
            </div>

            <div class="actions">
                <button class={modoEdicion ? 'btn-update' : 'btn-save'} onclick={gestionarProducto}>
                    {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
                
                {#if modoEdicion}
                    <button class="btn-cancel" onclick={cancelarEdicion}>❌</button>
                {/if}
            </div>
        </div>
    </section>

    <section class="panel list-panel">
        <div class="toolbar">
            <div class="search-group">
                <label for="buscador">🔍 Buscador del sistema:</label>
                <input 
                    id="buscador"
                    type="text" 
                    placeholder="Escribe el nombre del producto..." 
                    bind:value={busqueda} 
                    class="search-input"
                />
            </div>
            <div class="filter-group">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label>Filtrar por Categoría:</label>
                <select bind:value={categoriaFiltro}>
                    {#each categoriasDisponibles as cat}
                        <option value={cat}>{cat}</option>
                    {/each}
                </select>
            </div>
        </div>

        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Fechas</th> <th>Existencias</th>
                        <th>Disponibilidad (HU04)</th>
                        <th style="text-align: center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each productosVisibles as item (item.id)}
                        <tr class:alerta={item.cantidad < item.stockMinimo && item.cantidad > 0}
                            class:agotado={item.cantidad <= 0}
                            class:seleccionado={item.id === idEdicion}>
                            
                            <td>
                                <strong>{item.nombre}</strong><br>
                                <span class="tag">{item.categoria}</span>
                            </td>
                            
                            <td class="fechas-col">
                                <div class="date-row">📅 Creado: {formatearFecha(item.fechaCreacion)}</div>
                                {#if item.fechaModificacion}
                                    <div class="date-row mod">📝 Última modificación: {formatearFecha(item.fechaModificacion)}</div>
                                {/if}
                            </td>
                            
                            <td>{item.cantidad}</td>
                            
                            <td>
                                {#if item.cantidad <= 0}
                                    <span class="badge red">🚫 Agotado</span>
                                {:else if item.cantidad < item.stockMinimo}
                                    <span class="badge yellow">⚠️ Stock Bajo</span>
                                {:else}
                                    <span class="badge green">✅ Disponible</span>
                                {/if}
                            </td>
                            
                            <td class="actions-cell">
                                <button class="btn-icon edit" onclick={() => iniciarEdicion(item)} title="Editar">✏️</button>
                                <button class="btn-icon del" onclick={() => eliminarProducto(item.id)} title="Borrar">🗑️</button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" class="empty">
                                {#if inventario.length === 0}
                                    Inventario vacío.
                                {:else}
                                    No se encontró "<strong>{busqueda}</strong>".
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </section>

    <div style = "display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;">

  <button type="button" class="btn btn-secondary btn-lg"
  onclick = {() => goto('/ruta_main')}
  >
    Volver al menú principal
  </button>

</div>

</div>

<style>
    .container { max-width: 950px; margin: 20px auto; font-family: sans-serif; color: #333; }
    .panel { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: 0.3s; }
    
    /* Estilos Modo Edición */
    .editing-mode { border-color: #ffc107; background-color: #fffdf5; border-left: 5px solid #ffc107; }
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .form-header h3 { margin: 0; }
    
    /* Formulario */
    .form-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end; }
    input, select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; flex: 1; height: 38px; box-sizing: border-box; }
    .input-small { flex: 0 0 70px; display: flex; flex-direction: column; }
    .lbl-tiny { font-size: 0.7rem; color: #666; margin-bottom: 2px; }
    
    /* Botones */
    button { border: none; border-radius: 4px; cursor: pointer; font-weight: bold; height: 38px; padding: 0 16px; }
    .actions { display: flex; gap: 5px; }
    .btn-save { background: #007bff; color: white; }
    .btn-save:hover { background: #0056b3; }
    .btn-update { background: #ffc107; color: #333; }
    .btn-update:hover { background: #e0a800; }
    .btn-cancel { background: #6c757d; color: white; padding: 0 10px; }
    .btn-cancel-top { background: transparent; color: #666; font-size: 0.8rem; height: auto; padding: 0; text-decoration: underline; }

    /* Tabla */
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; vertical-align: middle; }
    th { background: #f1f3f5; font-weight: 600; }
    
    /* Fechas */
    .fechas-col { font-size: 0.75rem; color: #666; }
    .date-row { white-space: nowrap; }
    .mod { color: #e67e22; font-weight: bold; }

    /* Estados Visuales */
    .alerta { background-color: #fff9db; }
    .agotado { background-color: #fff5f5; opacity: 0.9; }
    .seleccionado { background-color: #e3f2fd; outline: 2px solid #2196f3; } /* Resaltar fila editada */

    .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; color: white; display: inline-block; }
    .green { background: #28a745; }
    .yellow { background: #ffc107; color: #333; }
    .red { background: #dc3545; }
    .tag { background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; color: #555; margin-top: 4px; display: inline-block; }

    .actions-cell { display: flex; gap: 5px; justify-content: center; }
    .btn-icon { background: white; border: 1px solid #ddd; width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; }
    .btn-icon:hover { background: #f8f9fa; }
    .btn-icon.del { color: #dc3545; border-color: #fadbd8; }
    .btn-icon.edit { color: #007bff; border-color: #d6e9f9; }
    
    .empty { text-align: center; padding: 30px; color: #777; font-style: italic; }
    
    .toolbar { display: flex; gap: 20px; margin-bottom: 15px; background: #f8f9fa; padding: 15px; border-radius: 6px; align-items: flex-end; }
    .search-group { flex: 2; } .filter-group { flex: 1; }
    .search-input { border: 2px solid #007bff; }
</style>