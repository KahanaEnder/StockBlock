<script lang="ts">
    import { StockItem } from '$lib/models/stock';
    import { stockStore } from '$lib/stores/stockStore';
    import { goto } from '$app/navigation';
    import { Routes } from '$lib/constants/routes';

    // --- ESTADO PRINCIPAL ---
    let inventario: StockItem[] = [];
    let errorMsg = '';
    let successMsg = '';

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
    async function gestionarProducto() {
        if (!nuevoNombre.trim()) return;
        const catFinal = nuevaCategoria.trim() === '' ? 'General' : nuevaCategoria;
        errorMsg = '';
        successMsg = '';

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
                successMsg = 'Producto actualizado';
                cancelarEdicion();
            } else {
                const nuevoItem = new StockItem(nuevoNombre, nuevaCantidad, catFinal, nuevoMinimo);
                await stockStore.add(nuevoItem);
                successMsg = 'Producto registrado';
                limpiarFormulario();
            }
        } catch (e: any) {
            errorMsg = `Error guardando: ${e.message || e}`;
        }
    }

    function iniciarEdicion(item: StockItem) {
        nuevoNombre = item.nombre;
        nuevaCantidad = item.cantidad;
        nuevaCategoria = item.categoria;
        nuevoMinimo = item.stockMinimo;
        idEdicion = item.id;
        modoEdicion = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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

<div class="dark-page">
    <h1 class="page-title">📦 Gestión de Stock</h1>

    <section class="dark-section">
        {#if errorMsg}
            <div class="msg msg-error">{errorMsg}</div>
        {/if}
        {#if successMsg}
            <div class="msg msg-success">{successMsg}</div>
        {/if}

        <!-- FORMULARIO -->
        <div class="card-glass w-full max-w-4xl">
            <h2 class="section-title">{modoEdicion ? '✏️ Editando Producto' : '➕ Registrar Nuevo Producto'}</h2>

            <div class="form-grid">
                <div class="form-group-dark">
                    <label for="nombre">Nombre</label>
                    <input id="nombre" type="text" placeholder="Ej: Arena" bind:value={nuevoNombre} class="input-dark" />
                </div>
                <div class="form-group-dark">
                    <label for="categoria">Categoría</label>
                    <input id="categoria" type="text" placeholder="Ej: Materiales" list="lista-cat" bind:value={nuevaCategoria} class="input-dark" />
                    <datalist id="lista-cat">
                        <option value="Materiales"></option>
                        <option value="Herramientas"></option>
                    </datalist>
                </div>
                <div class="form-group-dark">
                    <label for="cantidad">Cantidad</label>
                    <input id="cantidad" type="number" bind:value={nuevaCantidad} class="input-dark" />
                </div>
                <div class="form-group-dark">
                    <label for="minimo">Stock Mínimo</label>
                    <input id="minimo" type="number" bind:value={nuevoMinimo} class="input-dark" />
                </div>
            </div>

            <div class="form-actions">
                <button class="btn-primary-dark" onclick={gestionarProducto}>
                    {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
                {#if modoEdicion}
                    <button class="btn-cancel-dark" onclick={cancelarEdicion}>Cancelar</button>
                {/if}
            </div>
        </div>

        <!-- LISTA -->
        <div class="card-glass w-full max-w-4xl">
            <h2 class="section-title">📋 Inventario</h2>

            <div class="toolbar">
                <div class="form-group-dark flex-2">
                    <label for="buscador">Buscar</label>
                    <input id="buscador" type="text" placeholder="Nombre del producto..." bind:value={busqueda} class="input-dark" />
                </div>
                <div class="form-group-dark flex-1">
                    <label for="filtro-cat">Categoría</label>
                    <select id="filtro-cat" bind:value={categoriaFiltro} class="input-dark">
                        {#each categoriasDisponibles as cat}
                            <option value={cat}>{cat}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="styled-table-dark text-sm">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Fechas</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each productosVisibles as item (item.id)}
                            <tr class:row-alerta={item.cantidad < item.stockMinimo && item.cantidad > 0}
                                class:row-agotado={item.cantidad <= 0}
                                class:row-edit={item.id === idEdicion}>
                                <td>
                                    <strong>{item.nombre}</strong>
                                    <span class="tag">{item.categoria}</span>
                                </td>
                                <td class="fechas-col">
                                    <div>Creado: {formatearFecha(item.fechaCreacion)}</div>
                                    {#if item.fechaModificacion}
                                        <div class="mod">Modificado: {formatearFecha(item.fechaModificacion)}</div>
                                    {/if}
                                </td>
                                <td class="font-bold">{item.cantidad}</td>
                                <td>
                                    {#if item.cantidad <= 0}
                                        <span class="badge red">Agotado</span>
                                    {:else if item.cantidad < item.stockMinimo}
                                        <span class="badge yellow">Stock Bajo</span>
                                    {:else}
                                        <span class="badge green">Disponible</span>
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
                                        No se encontró "{busqueda}".
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="volver-container">
            <button class="btn btn-outline-light btn-lg volver-btn" onclick={() => goto(Routes.MAIN)}>
                Volver al menú principal
            </button>
        </div>
    </section>
</div>

<style>
    .form-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    @media (max-width: 768px) {
        .form-grid { grid-template-columns: 1fr 1fr; }
    }

    .toolbar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
</style>
