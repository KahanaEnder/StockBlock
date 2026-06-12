<script lang="ts">
    import { ProductionRecord } from '$lib/models/production';
    import type { StockItem } from '$lib/models/stock';
    import { stockStore } from '$lib/stores/stockStore';
    import { produccionStore } from '$lib/stores/produccionStore';
    import { goto } from '$app/navigation';

    // --- ESTADO ---
    let produccion: ProductionRecord[] = [];
    let stock: StockItem[] = [];
    let listaProductosStock: string[] = [];
    let successMsg = '';
    let errorMsg = '';

    produccionStore.subscribe(value => { produccion = value; });
    stockStore.subscribe(value => {
        stock = value;
        listaProductosStock = [...new Set(stock.map(i => i.nombre))];
    });

    // Variables de Formulario
    let fechaInput = new Date().toISOString().split('T')[0];
    let productoSeleccionado = '';
    let cantidadInput = 0;

    // Variables de Edición
    let modoEdicion = false;
    let idEdicion: string | number | null = null;
    let cantidadAnterior = 0;

    // Variables de Filtro
    let fechaFiltro = new Date().toISOString().split('T')[0];

    // --- LÓGICA ---
    $: registrosVisibles = produccion.filter(p => p.fechaProduccion === fechaFiltro);
    $: totalDia = registrosVisibles.reduce((sum, item) => sum + item.cantidad, 0);

    function formatearFechaHora(isoString: string | null) {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }

    function actualizarStock(nombreProducto: string, cantidad: number) {
        stockStore.replace(
            item => item.nombre === nombreProducto,
            item => ({
                ...item,
                cantidad: item.cantidad + cantidad,
                fechaModificacion: new Date().toISOString()
            })
        );
    }

    function gestionarProduccion() {
        if (!productoSeleccionado || cantidadInput <= 0) {
            errorMsg = 'Selecciona un producto válido y cantidad mayor a 0';
            return;
        }
        errorMsg = '';
        successMsg = '';

        if (modoEdicion && idEdicion !== null) {
            const registroEditado = produccion.find(p => p.id === idEdicion);
            if (registroEditado) {
                const diferencia = cantidadInput - cantidadAnterior;
                if (registroEditado.productoNombre !== productoSeleccionado) {
                    actualizarStock(registroEditado.productoNombre, -cantidadAnterior);
                    actualizarStock(productoSeleccionado, cantidadInput);
                } else {
                    actualizarStock(productoSeleccionado, diferencia);
                }
            }

            produccionStore.replace(item => String(item.id) === String(idEdicion), item => ({
                ...item,
                productoNombre: productoSeleccionado,
                cantidad: cantidadInput,
                fechaProduccion: fechaInput,
                fechaModificacion: new Date().toISOString()
            }));
            successMsg = 'Registro editado. Stock actualizado.';
            cancelarEdicion();
        } else {
            const nuevoRegistro = new ProductionRecord(productoSeleccionado, cantidadInput, fechaInput);
            produccionStore.add(nuevoRegistro);
            actualizarStock(productoSeleccionado, cantidadInput);
            successMsg = 'Registro creado. Stock actualizado.';
            cantidadInput = 0;
        }
    }

    function iniciarEdicion(item: ProductionRecord) {
        idEdicion = item.id;
        productoSeleccionado = item.productoNombre;
        cantidadInput = item.cantidad;
        cantidadAnterior = item.cantidad;
        fechaInput = item.fechaProduccion;
        modoEdicion = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelarEdicion() {
        modoEdicion = false;
        idEdicion = null;
        cantidadInput = 0;
        cantidadAnterior = 0;
        fechaInput = new Date().toISOString().split('T')[0];
    }

    function eliminarRegistro(id: string | number) {
        if(confirm('¿Eliminar este registro? El stock será ajustado.')) {
            const registroEliminar = produccion.find(p => String(p.id) === String(id));
            if (registroEliminar) {
                actualizarStock(registroEliminar.productoNombre, -registroEliminar.cantidad);
            }
            produccionStore.remove(p => String(p.id) === String(id));
        }
    }
</script>

<div class="dark-page">
    <h1 class="page-title">🏭 Registro de Producción</h1>

    <section class="dark-section">
        {#if errorMsg}
            <div class="msg msg-error">{errorMsg}</div>
        {/if}
        {#if successMsg}
            <div class="msg msg-success">{successMsg}</div>
        {/if}

        <!-- FORMULARIO -->
        <div class="card-glass w-full max-w-4xl">
            <h2 class="section-title">{modoEdicion ? '📝 Corrigiendo Registro' : '🧱 Registrar Producción del Turno'}</h2>

            <div class="form-grid">
                <div class="form-group-dark">
                    <label for="fecha">Fecha Producción</label>
                    <input id="fecha" type="date" bind:value={fechaInput} class="input-dark" />
                </div>
                <div class="form-group-dark flex-2">
                    <label for="producto">Producto</label>
                    <select id="producto" bind:value={productoSeleccionado} class="input-dark">
                        <option value="" disabled selected>-- Seleccionar --</option>
                        {#each listaProductosStock as nombreProd}
                            <option value={nombreProd}>{nombreProd}</option>
                        {:else}
                            <option value="" disabled>No hay productos en Inventario</option>
                        {/each}
                    </select>
                </div>
                <div class="form-group-dark">
                    <label for="cantidad">Cantidad</label>
                    <input id="cantidad" type="number" min="1" placeholder="0" bind:value={cantidadInput} class="input-dark" />
                </div>
            </div>

            <div class="form-actions">
                <button class="btn-primary-dark" onclick={gestionarProduccion}>
                    {modoEdicion ? 'Corregir' : 'Registrar'}
                </button>
                {#if modoEdicion}
                    <button class="btn-cancel-dark" onclick={cancelarEdicion}>Cancelar</button>
                {/if}
            </div>
        </div>

        <!-- INFORME -->
        <div class="card-glass w-full max-w-4xl">
            <h2 class="section-title">📊 Informe Diario</h2>

            <div class="dashboard-bar">
                <div class="form-group-dark">
                    <label for="fecha-filtro">Ver producción del día:</label>
                    <input id="fecha-filtro" type="date" bind:value={fechaFiltro} class="input-dark" />
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">TOTAL PRODUCIDO</div>
                    <div class="kpi-value">{totalDia} <small>unidades</small></div>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="styled-table-dark text-sm">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Auditoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each registrosVisibles as item (item.id)}
                            <tr class:row-edit={item.id === idEdicion}>
                                <td>{item.fechaProduccion}</td>
                                <td><strong>{item.productoNombre}</strong></td>
                                <td class="text-var(--accent-blue) font-bold">+{item.cantidad}</td>
                                <td class="text-var(--text-tertiary) text-xs">
                                    <div>Creado: {formatearFechaHora(item.fechaRegistro)}</div>
                                    {#if item.fechaModificacion}
                                        <div class="text-[#f59e0b] font-bold">Editado: {formatearFechaHora(item.fechaModificacion)}</div>
                                    {/if}
                                </td>
                                <td class="actions-cell">
                                    <button class="btn-icon edit" onclick={() => iniciarEdicion(item)} title="Editar">✏️</button>
                                    <button class="btn-icon del" onclick={() => eliminarRegistro(item.id)} title="Eliminar">🗑️</button>
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="5" class="empty">No hay registros para la fecha {fechaFiltro}.</td>
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
        grid-template-columns: 1fr 2fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    @media (max-width: 768px) {
        .form-grid { grid-template-columns: 1fr; }
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

    .dashboard-bar {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .kpi-card { text-align: right; }
    .kpi-label { font-size: 0.7rem; color: var(--text-tertiary); letter-spacing: 1px; font-weight: bold; }
    .kpi-value { font-size: 1.8rem; font-weight: bold; color: white; }
    .kpi-value small { font-size: 0.9rem; font-weight: normal; color: var(--text-tertiary); }

    .flex-2 { flex: 2; }

    .row-edit { background: rgba(79, 131, 247, 0.12); }

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
