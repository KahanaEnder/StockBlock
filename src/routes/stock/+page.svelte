<script lang="ts">
    import { StockItem } from '$lib/models/stock';
    import { stockStore } from '$lib/stores/stockStore';
    import { goto } from '$app/navigation';
    import { Routes } from '$lib/constants/routes';
    import NumberStepper from '$lib/components/NumberStepper.svelte';
    import { STOCK_COLORS, STOCK_COLOR_HEX } from '$lib/constants/stock-colors';

    // --- ESTADO PRINCIPAL ---
    let inventario: StockItem[] = [];
    let errorMsg = '';
    let successMsg = '';

    stockStore.subscribe(value => { inventario = value.map(i => ({ ...i, color: i.color || 'Gris' })); });

    // --- ESTADO DEL FORMULARIO Y EDICIÓN ---
    let modoEdicion = false;
    let idEdicion: string | number | null = null;

    let nuevoNombre = '';
    let nuevaCantidad: number | null = null;
    let nuevaCategoria = '';
    let nuevoColor = '';
    let nuevoMinimo: number | null = null;

    // --- ESTADO DE FILTROS (HU04) ---
    let busqueda = '';
    let categoriaFiltro = 'Todas';
    let colorFiltro = 'Todos';
    let estadoFiltro = 'Todos';
    let agruparEstado = 'disp-bajo-ago';
    let ordenStock = 'ninguno';

    // --- CATEGORÍAS Y COLORES DINÁMICOS ---
    $: categoriasExistentes = [...new Set(inventario.map(i => i.categoria).filter(Boolean))];
    $: coloresExistentes = [...new Set(inventario.map(i => i.color).filter(Boolean))];

    // Sugerencias para el formulario: colores predefinidos + los que ya existen en inventario
    $: sugerenciasColores = [...new Set([...STOCK_COLORS, ...coloresExistentes])];

    // --- LÓGICA HU04 (Filtros) ---
    $: categoriasDisponibles = ['Todas', ...categoriasExistentes];
    $: coloresDisponibles = ['Todos', ...sugerenciasColores];

    function estadoDe(item: StockItem): 'disponible' | 'bajo' | 'agotado' {
        if (item.cantidad <= 0) return 'agotado';
        if (item.cantidad < item.stockMinimo) return 'bajo';
        return 'disponible';
    }

    function rankEstado(item: StockItem, agrupar: string): number {
        const e = estadoDe(item);
        if (agrupar === 'ago-bajo-disp') return e === 'agotado' ? 0 : e === 'bajo' ? 1 : 2;
        return e === 'disponible' ? 0 : e === 'bajo' ? 1 : 2;
    }

    function calcularProductosVisibles(
        busqueda: string,
        categoriaFiltro: string,
        colorFiltro: string,
        estadoFiltro: string,
        agruparEstado: string,
        ordenStock: string,
        inventario: StockItem[]
    ): StockItem[] {
        return inventario.filter(item => {
            const nombreMatch = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
            const catMatch = categoriaFiltro === 'Todas' || item.categoria === categoriaFiltro;
            const colMatch = colorFiltro === 'Todos' || item.color === colorFiltro;
            return nombreMatch && catMatch && colMatch;
        }).filter(item => estadoFiltro === 'Todos' || estadoDe(item) === estadoFiltro).sort((a, b) => {
            const porEstado = rankEstado(a, agruparEstado) - rankEstado(b, agruparEstado);
            if (porEstado !== 0) return porEstado;
            if (ordenStock === 'asc') return a.cantidad - b.cantidad;
            if (ordenStock === 'desc') return b.cantidad - a.cantidad;
            return 0;
        });
    }

    $: productosVisibles = calcularProductosVisibles(busqueda, categoriaFiltro, colorFiltro, estadoFiltro, agruparEstado, ordenStock, inventario);

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
        const nombreFinal = nuevoNombre.trim();
        let catFinal = nuevaCategoria.trim() === '' ? 'General' : nuevaCategoria;
        let colorFinal = nuevoColor.trim() === '' ? 'Gris' : nuevoColor;
        errorMsg = '';
        successMsg = '';

        // --- Normalización de categoría y color (case-insensitive para evitar duplicados por mayúsculas/minúsculas) ---
        const normalizaciones: string[] = [];

        const catExistente = inventario.find(item =>
            String(item.id) !== String(idEdicion) &&
            item.categoria.trim().toLowerCase() === catFinal.trim().toLowerCase() &&
            item.categoria.trim() !== catFinal.trim()
        );
        if (catExistente) {
            normalizaciones.push(`categoría "${catFinal}" → "${catExistente.categoria}"`);
            catFinal = catExistente.categoria;
        }

        const colorExistente = inventario.find(item =>
            String(item.id) !== String(idEdicion) &&
            (item.color || 'Gris').trim().toLowerCase() === colorFinal.trim().toLowerCase() &&
            (item.color || 'Gris').trim() !== colorFinal.trim()
        );
        if (colorExistente) {
            normalizaciones.push(`color "${colorFinal}" → "${colorExistente.color || 'Gris'}"`);
            colorFinal = colorExistente.color || 'Gris';
        }

        const notaNormalizacion = normalizaciones.length > 0 ? ` — Normalizado: ${normalizaciones.join('; ')}` : '';

        // --- Validaciones de lógica ---
        const cantidadFinal = nuevaCantidad ?? 0;
        const minimoFinal = nuevoMinimo ?? 0;

        if (Number.isNaN(cantidadFinal)) {
            errorMsg = 'La cantidad no es un número válido. Escribe solo números (0 si está vacío).';
            return;
        }
        if (Number.isNaN(minimoFinal)) {
            errorMsg = 'El stock mínimo no es un número válido. Escribe solo números (0 si está vacío).';
            return;
        }

        if (cantidadFinal < 0) {
            errorMsg = 'La cantidad no puede ser negativa.';
            return;
        }
        if (minimoFinal < 0) {
            errorMsg = 'El stock mínimo no puede ser negativo.';
            return;
        }
        const colorSoloTexto = /^[\p{L}\s-]+$/u;
        if (!colorSoloTexto.test(colorFinal) || !/\p{L}/u.test(colorFinal)) {
            errorMsg = 'El color debe ser texto (letras, espacios o guiones), no puede ser solo números.';
            return;
        }
        if (minimoFinal > cantidadFinal && cantidadFinal > 0) {
            const continuar = confirm(
                `El stock mínimo (${minimoFinal}) es mayor que la cantidad actual (${cantidadFinal}). ¿Continuar?`
            );
            if (!continuar) return;
        }

        // --- Validaciones de duplicados (solo al crear) ---
        if (!(modoEdicion && idEdicion !== null)) {
            // El nombre se compara case-insensitive; categoría y color case-sensitive (exactos)
            const duplicados = inventario.filter(item =>
                String(item.id) !== String(idEdicion) &&
                item.nombre.trim().toLowerCase() === nombreFinal.toLowerCase()
            );

            const mismoNombreMismaCategoriaMismoColor = duplicados.some(item =>
                item.categoria.trim() === catFinal.trim() &&
                (item.color || '').trim() === colorFinal.trim()
            );
            if (mismoNombreMismaCategoriaMismoColor) {
                errorMsg = `Error: ${nombreFinal} ya existe en la categoría "${catFinal}" con el color "${colorFinal}". No se puede crear un producto duplicado.`;
                return;
            }

            const mismaCategoriaDistintoColor = duplicados.some(item =>
                item.categoria.trim() === catFinal.trim()
            );
            if (mismaCategoriaDistintoColor) {
                const coloresExistentesMsg = [...new Set(duplicados
                    .filter(d => d.categoria.trim() === catFinal.trim())
                    .map(d => d.color || 'Gris')
                )].join(', ');
                const confirmar = confirm(
                    `Advertencia: ${nombreFinal} ya existe en la categoría "${catFinal}" con color(es) "${coloresExistentesMsg}". ` +
                    `¿Seguro que quieres crearlo con el color "${colorFinal}"?`
                );
                if (!confirmar) return;
            } else if (duplicados.length > 0) {
                const categoriasExistentesMsg = [...new Set(duplicados.map(d => d.categoria))].join(', ');
                const confirmar = confirm(
                    `Advertencia: ${nombreFinal} ya existe en la categoría "${categoriasExistentesMsg}". ` +
                    `¿Seguro que quieres crearlo en "${catFinal}"?`
                );
                if (!confirmar) return;
            }
        }

        try {
            if (modoEdicion && idEdicion !== null) {
                stockStore.replace(item => String(item.id) === String(idEdicion), item => ({
                    ...item,
                    nombre: nombreFinal,
                    cantidad: cantidadFinal,
                    categoria: catFinal,
                    color: colorFinal,
                    stockMinimo: minimoFinal,
                    fechaModificacion: new Date().toISOString()
                }));
                successMsg = 'Producto actualizado' + notaNormalizacion;
                cancelarEdicion();
            } else {
                const nuevoItem = new StockItem(nombreFinal, cantidadFinal, catFinal, minimoFinal, colorFinal);
                await stockStore.add(nuevoItem);
                successMsg = 'Producto registrado' + notaNormalizacion;
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
        nuevoColor = item.color || 'Gris';
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
        nuevaCantidad = null;
        nuevaCategoria = '';
        nuevoColor = '';
        nuevoMinimo = null;
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
                <div class="form-group-dark span-2">
                    <label for="nombre">Nombre</label>
                    <input id="nombre" type="text" placeholder="Ej: Arena" bind:value={nuevoNombre} class="input-dark" />
                </div>
                <div class="form-group-dark">
                    <label for="categoria">Categoría</label>
                    <input id="categoria" type="text" placeholder="Ej: Materiales" list="lista-cat" bind:value={nuevaCategoria} class="input-dark" />
                    <datalist id="lista-cat">
                        {#each categoriasExistentes as cat}
                            <option value={cat}></option>
                        {/each}
                    </datalist>
                </div>
                <div class="form-group-dark">
                    <label for="color" title="Déjalo vacío para usar Gris por defecto">Color</label>
                    <input id="color" type="text" placeholder="Gris (por defecto)" list="lista-colores" bind:value={nuevoColor} class="input-dark" />
                    <datalist id="lista-colores">
                        {#each sugerenciasColores as c}
                            <option value={c}></option>
                        {/each}
                    </datalist>
                </div>
                <div class="form-group-dark span-2">
                    <label for="cantidad" title="Cantidad inicial de unidades del producto">Cantidad</label>
                    <NumberStepper id="cantidad" bind:value={nuevaCantidad} min={0} />
                </div>
                <div class="form-group-dark span-2">
                    <label for="minimo" title="Cantidad mínima de unidades para alertar reposición">Stock Mínimo</label>
                    <NumberStepper id="minimo" bind:value={nuevoMinimo} min={0} />
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
                <div class="form-group-dark flex-1">
                    <label for="filtro-color">Color</label>
                    <select id="filtro-color" bind:value={colorFiltro} class="input-dark">
                        {#each coloresDisponibles as c}
                            <option value={c}>{c}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="toolbar">
                <div class="form-group-dark flex-1">
                    <label for="filtro-estado">Estado</label>
                    <select id="filtro-estado" bind:value={estadoFiltro} class="input-dark">
                        <option value="Todos">Todos</option>
                        <option value="disponible">Disponible</option>
                        <option value="bajo">Stock Bajo</option>
                        <option value="agotado">Agotado</option>
                    </select>
                </div>
                <div class="form-group-dark flex-1">
                    <label for="agrupar-estado">Agrupar por Estado</label>
                    <select id="agrupar-estado" bind:value={agruparEstado} class="input-dark">
                        <option value="disp-bajo-ago">Disponible → Stock Bajo → Agotado</option>
                        <option value="ago-bajo-disp">Agotado → Stock Bajo → Disponible</option>
                    </select>
                </div>
                <div class="form-group-dark flex-1">
                    <label for="orden-stock">Ordenar Stock</label>
                    <select id="orden-stock" bind:value={ordenStock} class="input-dark">
                        <option value="ninguno">Sin orden</option>
                        <option value="asc">Menor → Mayor</option>
                        <option value="desc">Mayor → Menor</option>
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
                                    <span class="color-chip" style={`--chip-bg: ${STOCK_COLOR_HEX[item.color] || '#9CA3AF'}`}>
                                        {item.color}
                                    </span>
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
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
    }
    .span-2 { grid-column: span 2; }
    @media (max-width: 768px) {
        .form-grid { grid-template-columns: 1fr 1fr; }
    }

    .toolbar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .color-chip {
        display: inline-block;
        margin-left: 0.5rem;
        padding: 0.1rem 0.5rem;
        border-radius: 0.3rem;
        font-size: 0.7rem;
        font-weight: 700;
        color: #111827;
        background: color-mix(in srgb, var(--chip-bg, #9CA3AF) 55%, white);
        border: 1px solid color-mix(in srgb, var(--chip-bg, #9CA3AF) 70%, black);
    }
</style>
