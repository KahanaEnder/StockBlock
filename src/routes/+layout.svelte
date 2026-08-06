<script lang="ts">
	import './layout.css';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/authStore';
	import {Routes} from '$lib/constants/routes';
	import {PlaceHolders} from '$lib/constants/placeholders'
 
	let { children } = $props();
	let authState = $state({ isLoggedIn: false, loading: true });
	let canRender = $state(false);
	let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

	const publicRoutes = [Routes.LOGIN];

	// Efecto para suscribirse al store y manejar autenticación
	$effect(() => {
		// Configurar fallback timer
		fallbackTimer = setTimeout(() => {
			if (!canRender) {
				console.warn(PlaceHolders.NOAUTH);
				authState = { ...authState, loading: false };
			}
		}, 5000);

		const unsubscribe = authStore.subscribe(state => {
			authState = state;

			if (!state.loading) {
				if (fallbackTimer) clearTimeout(fallbackTimer);
				const currentPath = page.url.pathname;
				const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));

				if (state.isLoggedIn || isPublicRoute) {
					canRender = true;
				} else {
					canRender = false;
					goto(Routes.LOGIN, { replaceState: true });
				}
			}
		});

		return () => {
			if (fallbackTimer) clearTimeout(fallbackTimer);
			unsubscribe();
		};
	});

	// Efecto para validar ruta cuando cambia
	$effect(() => {
		if (authState.loading) return;

		const currentPath = page.url.pathname;
		const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));

		if (authState.isLoggedIn || isPublicRoute) {
			canRender = true;
		} else {
			canRender = false;
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
	{@render children()}
{/if}
