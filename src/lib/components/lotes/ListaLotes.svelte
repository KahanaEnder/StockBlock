<script lang="ts">
    import { lotesStore } from '$lib/stores/lotesStore';
</script>

<div class="card-glass">
    <h2 class="section-title">Lotes producidos</h2>

    {#if $lotesStore.length === 0}
        <p class="empty">No hay lotes registrados.</p>
    {/if}

    {#each $lotesStore as lote}
        <div class="item">
            <strong>Producto:</strong> {lote.producto}<br>
            <strong>Cantidad:</strong> {lote.cantidad}<br>
            <strong>Estado:</strong> {lote.estado}<br>
            <small>Fecha: {new Date(lote.fechaCreacion).toLocaleString()}</small>
        </div>
    {/each}
</div>

<style>
.card-glass {
    padding: 1.5rem;
}
.item {
    padding: .75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: .5rem;
}
</style>
