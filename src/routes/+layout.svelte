<script lang="ts">
	import './layout.css';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/authStore';
	import {Routes} from '$lib/constants/routes';
	import {PlaceHolders} from '$lib/constants/placeholders'
	import Nav from '$lib/components/Nav.svelte';
 
	let { children } = $props();
	let authState = $state({ isLoggedIn: false, loading: true });
	let canRender = $state(false);

	const publicRoutes: string[] = [Routes.LOGIN];

	// Suscribirse al store de autenticación
	$effect(() => {
		const unsubscribe = authStore.subscribe(state => {
			authState = state;
		});

		return () => unsubscribe();
	});

	// Guard reactivo: decide qué renderizar según auth y ruta
	$effect(() => {
		if (authState.loading) return;

		const path = page.url.pathname;

		if (path === '/') {
			goto(authState.isLoggedIn ? Routes.MAIN : Routes.LOGIN, { replaceState: true });
			canRender = false;
			return;
		}

		// Si está logueado y entra a /login, nunca mostrar login: ir a inicio
		if (authState.isLoggedIn && publicRoutes.includes(path)) {
			goto(Routes.MAIN, { replaceState: true });
			canRender = false;
			return;
		}

		const isPublicRoute = publicRoutes.includes(path);
		canRender = authState.isLoggedIn || isPublicRoute;

		if (!canRender) {
			goto(Routes.LOGIN, { replaceState: true });
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={PlaceHolders.ICON}/>
</svelte:head>

{#if authState.loading}
	<div class="dark-page flex items-center justify-center h-screen">
		<div class="text-white text-xl">{PlaceHolders.LOADING}</div>
	</div>
{:else if canRender}
	{#if authState.isLoggedIn}
		<Nav />
		<div class="app-content">
			{@render children()}
		</div>
	{:else}
		{@render children()}
	{/if}
{/if}
