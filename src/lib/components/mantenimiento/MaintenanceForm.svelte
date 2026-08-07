<script lang="ts">
    import { onMount } from 'svelte';
    import { mantenimientoStore } from '$lib/stores/mantenimientoStore';
    import type { Mantenimiento } from '$lib/models/mantenimiento';
    import { goto } from '$app/navigation';
    import { Routes } from '$lib/constants/routes';

    // --- INTERFACES ---
    interface Errors {
        fecha?: string;
        maquina?: string;
        observaciones?: string;
        tecnico?: string;
    }

    // --- ESTADO ---
    let formData = $state({
        fecha: '',
        maquina: '',
        observaciones: '',
        repuestos: '',
        tecnico: ''
    });

    let editingId: number | null = $state(null);
    let historial: Mantenimiento[] = $state([]);
    let errors: Errors = $state({});
    let successMessage: string = $state('');

    // Paginación
    let currentPage: number = $state(1);
    const itemsPerPage: number = 5;
    let paginatedData = $derived(
        historial.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
    );
    let totalPages = $derived(Math.ceil(historial.length / itemsPerPage));

    // Listas maestras
    const maquinas: string[] = ['Torno CNC-01', 'Fresadora-02', 'Prensa Hidráulica-03', 'Soldadora-04', 'Compresor-05'];
    const tecnicos: string[] = ['Juan Pérez', 'María López', 'Carlos Ruiz', 'Ana García', 'Roberto Sánchez'];

    // --- CICLO DE VIDA ---
    onMount((): void => {
        mantenimientoStore.subscribe(value => {
            historial = value;
        });
    });

    // --- LÓGICA DE DATOS ---
    function validarFormulario(): boolean {
        errors = {};
        if (!formData.fecha) errors.fecha = 'La fecha es requerida';
        if (!formData.maquina) errors.maquina = 'Debe seleccionar una máquina';
        if (!formData.observaciones || formData.observaciones.trim().length === 0)
            errors.observaciones = 'Las observaciones son requeridas';
        if (!formData.tecnico) errors.tecnico = 'El técnico es requerido';
        return Object.keys(errors).length === 0;
    }

    // --- LÓGICA PRINCIPAL (CREAR / EDITAR) ---
    function handleSubmit(): void {
        if (!validarFormulario()) return;

        if (editingId !== null) {
            mantenimientoStore.replace(
                item => item.id === editingId,
                item => ({
                    ...item,
                    ...formData,
                    repuestos: formData.repuestos || 'N/A',
                    fechaModificacion: new Date().toLocaleString('es-CO')
                })
            );
            
            successMessage = '✓ Registro actualizado exitosamente';
            cancelarEdicion();

        } else {
            const nuevoRegistro: Mantenimiento = {
                id: Date.now(),
                ...formData,
                repuestos: formData.repuestos || 'N/A',
                fechaRegistro: new Date().toLocaleString('es-CO')
            };

            mantenimientoStore.add(nuevoRegistro);
            successMessage = '✓ Registro guardado exitosamente';
            limpiarFormulario();
        }
        
        setTimeout((): void => {
            successMessage = '';
        }, 3000);
    }

    // --- FUNCIONES DE EDICIÓN ---
    function cargarParaEditar(registro: Mantenimiento): void {
        // Rellenamos el formulario con los datos del registro
        formData = {
            fecha: registro.fecha,
            maquina: registro.maquina,
            observaciones: registro.observaciones,
            repuestos: registro.repuestos,
            tecnico: registro.tecnico
        };
        editingId = registro.id;
        
        // Scroll suave hacia el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelarEdicion(): void {
        editingId = null;
        limpiarFormulario();
    }

    function limpiarFormulario(): void {
        formData = {
            fecha: '',
            maquina: '',
            observaciones: '',
            repuestos: '',
            tecnico: ''
        };
        errors = {};
    }

    function eliminarRegistro(id: number): void {
        if (confirm('¿Está seguro de que desea eliminar este registro?')) {
            mantenimientoStore.remove(item => item.id === id);
            if (editingId === id) cancelarEdicion();
        }
    }

    // --- PAGINACIÓN ---
    function nextPage(): void { if (currentPage < totalPages) currentPage++; }
    function prevPage(): void { if (currentPage > 1) currentPage--; }

</script>

<div class="maintenance-container dark-section">

    <h1 class="page-title">Gestión de Mantenimiento</h1>

    {#if successMessage}
        <div class="msg msg-success">
            {successMessage}
        </div>
    {/if}

    <!-- FORMULARIO -->
    <div class="form-section" class:editing-mode={editingId !== null}>
        <div class="form-header">
            <h2>{editingId !== null ? 'Editando Intervención' : 'Registrar Intervención'}</h2>
            {#if editingId !== null}
                <button type="button" class="btn-cancel-link" onclick={cancelarEdicion}>Cancelar edición</button>
            {/if}
        </div>
        
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div class="form-row">
                <div class="form-group-dark">
                    <label for="fecha">Fecha de Intervención *</label>
                    <input
                        id="fecha"
                        class="input-dark"
                        type="date"
                        bind:value={formData.fecha}
                        class:error={errors.fecha}
                    />
                    {#if errors.fecha}<span class="error-text">{errors.fecha}</span>{/if}
                </div>

                <div class="form-group-dark">
                    <label for="maquina">Máquina *</label>
                    <select id="maquina" class="input-dark" bind:value={formData.maquina} class:error={errors.maquina}>
                        <option value="">-- Seleccionar máquina --</option>
                        {#each maquinas as maq}
                            <option value={maq}>{maq}</option>
                        {/each}
                    </select>
                    {#if errors.maquina}<span class="error-text">{errors.maquina}</span>{/if}
                </div>

                <div class="form-group-dark">
                    <label for="tecnico">Técnico Responsable *</label>
                    <select id="tecnico" class="input-dark" bind:value={formData.tecnico} class:error={errors.tecnico}>
                        <option value="">-- Seleccionar técnico --</option>
                        {#each tecnicos as tech}
                            <option value={tech}>{tech}</option>
                        {/each}
                    </select>
                    {#if errors.tecnico}<span class="error-text">{errors.tecnico}</span>{/if}
                </div>
            </div>

            <div class="form-row">
                <div class="form-group-dark full-width">
                    <label for="observaciones">Observaciones *</label>
                    <textarea
                        id="observaciones"
                        class="input-dark"
                        bind:value={formData.observaciones}
                        placeholder="Describa el estado de la máquina y acciones realizadas"
                        rows="4"
                        class:error={errors.observaciones}
                    ></textarea>
                    {#if errors.observaciones}<span class="error-text">{errors.observaciones}</span>{/if}
                </div>
            </div>

            <div class="form-row">
                <div class="form-group-dark full-width">
                    <label for="repuestos">Repuestos Utilizados</label>
                    <input
                        id="repuestos"
                        class="input-dark"
                        type="text"
                        bind:value={formData.repuestos}
                        placeholder="Ej: Rodamientos, correas, aceite ISO 46 (opcional)"
                    />
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-primary" class:btn-warning={editingId !== null}>
                    {editingId !== null ? 'Actualizar Registro' : 'Guardar Registro'}
                </button>
                
                {#if editingId !== null}
                    <button type="button" class="btn-cancel-dark" onclick={cancelarEdicion}>
                        Cancelar
                    </button>
                {/if}
            </div>
        </form>
    </div>

    <!-- HISTORIAL -->
    <div class="history-section">
        <h2>Historial de Intervenciones ({historial.length})</h2>

        {#if historial.length === 0}
            <div class="empty">
                <p>No hay registros de mantenimiento. ¡Crea uno nuevo!</p>
            </div>
        {:else}
            <div class="table-responsive">
                <table class="styled-table-dark history-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Máquina</th>
                            <th>Técnico</th>
                            <th>Observaciones</th>
                            <th>Repuestos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each paginatedData as registro (registro.id)}
                            <tr class:row-selected={registro.id === editingId}>
                                <td>{new Date(registro.fecha).toLocaleDateString('es-CO')}</td>
                                <td><span class="badge">{registro.maquina}</span></td>
                                <td>{registro.tecnico}</td>
                                <td class="obs-cell">{registro.observaciones}</td>
                                <td class="repuestos-cell">{registro.repuestos}</td>
                                <td class="actions-cell">
                                    <!-- BOTÓN EDITAR -->
                                    <button 
                                        class="btn-icon edit" 
                                        onclick={() => cargarParaEditar(registro)}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <!-- BOTÓN ELIMINAR -->
                                    <button
                                        class="btn-icon delete"
                                        onclick={() => eliminarRegistro(registro.id)}
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- PAGINACIÓN -->
            {#if totalPages > 1}
                <div class="pagination">
                    <button onclick={prevPage} disabled={currentPage === 1} class="btn btn-nav">← Anterior</button>
                    <span class="page-info">Página {currentPage} de {totalPages}</span>
                    <button onclick={nextPage} disabled={currentPage === totalPages} class="btn btn-nav">Siguiente →</button>
                </div>
            {/if}
        {/if}
    </div>
</div>

<div class="volver-container">
    <button type="button" class="btn btn-outline-light btn-lg volver-btn" onclick={() => goto(Routes.MAIN)}>
        Volver al menú principal
    </button>
</div>

<style>
    /* Estilos oscuros basados en layout.css */
    .maintenance-container {
        max-width: 1200px; margin: 0 auto; padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex; flex-direction: column; gap: 1rem;
    }

    h2 { color: var(--text-primary); margin-bottom: 0; font-size: 1.25rem; }

    /* Formulario */
    .form-section {
        width: 100%;
        max-width: 48rem;
        background: rgba(255, 255, 255, 0.07);
        padding: 1.5rem;
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.13);
        backdrop-filter: blur(12px);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.18);
        transition: all 0.3s ease;
    }

    /* Estilo especial cuando se edita */
    .editing-mode {
        border-left: 5px solid #f59e0b;
        border-color: rgba(245, 158, 11, 0.5);
    }

    .form-header {
        display: flex; justify-content: space-between; align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 0.75rem; margin-bottom: 1.25rem;
    }
    .editing-mode .form-header { border-bottom-color: rgba(245, 158, 11, 0.5); }

    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .form-group-dark.full-width { grid-column: 1 / -1; width: 100%; }

    .error-text { color: #f87171; font-size: 0.8rem; margin-top: 0.25rem; }
    .error { border-color: #f87171 !important; background: rgba(248, 113, 113, 0.1) !important; }

    /* Botones */
    .btn-cancel-link {
        background: none; border: none; color: #f87171;
        text-decoration: underline; cursor: pointer; font-size: 0.9rem;
    }

    .btn-primary {
        background: linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
        color: #fff; padding: 0.75rem 1.5rem;
        border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;
        transition: all 0.2s; flex: 1;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 16px var(--accent-glow); }
    .btn-warning { background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%); }
    .btn-warning:hover { background: linear-gradient(90deg, #d97706 0%, #f59e0b 100%); }

    /* Historial */
    .history-section {
        width: 100%;
        max-width: 1200px;
        background: rgba(255, 255, 255, 0.06);
        padding: 1.5rem;
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.13);
    }

    .history-table { font-size: 0.9rem; margin-top: 0.75rem; }

    .badge { background: rgba(118, 169, 250, 0.15); color: var(--accent-blue); border: 1px solid rgba(118, 169, 250, 0.3); padding: 0.2rem 0.5rem; border-radius: 0.4rem; font-weight: 600; }
    .obs-cell { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .repuestos-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .row-selected td { background: rgba(250, 204, 21, 0.08) !important; }

    /* Paginación */
    .pagination {
        display: flex; justify-content: center; gap: 1rem; margin-top: 1.25rem; align-items: center;
        color: var(--text-primary);
    }
    .btn-nav {
        background: linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-blue-dark) 100%);
        color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;
    }
    .btn-nav:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-info { font-size: 0.9rem; }
</style>