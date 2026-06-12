<script lang="ts">
    import { StockItem } from '$lib/models/stock';
    import { stockStore } from '$lib/stores/stockStore';
    import { goto } from '$app/navigation';

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

    .form-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    @media (max-width: 768px) {
        .form-grid { grid-template-columns: 1fr 1fr; }
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

    .form-actions {
        display: flex;
        gap: 0.75rem;
    }
    .btn-cancel-dark {
        padding: 0.6rem 1.2rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: transparent;
        color: white;
        font-weight: 600;
        cursor: pointer;
    }
    .btn-cancel-dark:hover { background: rgba(255, 255, 255, 0.1); }

    .toolbar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    .fechas-col { font-size: 0.75rem; color: var(--text-tertiary); }
    .mod { color: #f59e0b; font-weight: bold; }

    .row-alerta { background: rgba(250, 204, 21, 0.08); }
    .row-agotado { background: rgba(248, 113, 113, 0.08); }
    .row-edit { background: rgba(79, 131, 247, 0.12); }

    .badge { padding: 0.2rem 0.5rem; border-radius: 0.3rem; font-size: 0.7rem; font-weight: 700; }
    .badge.green { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
    .badge.yellow { background: rgba(250, 204, 21, 0.2); color: #facc15; }
    .badge.red { background: rgba(248, 113, 113, 0.2); color: #f87171; }

    .tag {
        background: rgba(255, 255, 255, 0.08);
        padding: 0.15rem 0.4rem;
        border-radius: 0.3rem;
        font-size: 0.7rem;
        color: var(--text-tertiary);
        margin-left: 0.5rem;
    }

    .actions-cell { display: flex; gap: 0.3rem; justify-content: center; }
    .btn-icon {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        width: 2rem;
        height: 2rem;
        border-radius: 0.4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.9rem;
    }
    .btn-icon:hover { background: rgba(255, 255, 255, 0.1); }
    .btn-icon.del { color: #f87171; }
    .btn-icon.edit { color: #60a5fa; }

    .empty { text-align: center; padding: 2rem; color: var(--text-tertiary); font-style: italic; }
    .font-bold { font-weight: 700; }
</style>
