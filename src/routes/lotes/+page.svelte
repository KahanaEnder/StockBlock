<script lang="ts">
    import AgregarLoteForm from '$lib/components/lotes/AgregarLoteForm.svelte';
    import ListaLotes from '$lib/components/lotes/ListaLotes.svelte';
</script>

<h1 class="page-title">Gestión de Lotes</h1>

<div class="lotes-grid">
    <div class="flex-1">
        <AgregarLoteForm />
    </div>

    <div class="flex-1">
        <ListaLotes />
    </div>
</div>

<style>
    .lotes-grid {
        display: flex;
        gap: 2rem;
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 2rem 3rem;
        box-sizing: border-box;
    }
    @media (max-width: 900px) {
        .lotes-grid { flex-direction: column; }
    }
</style>
