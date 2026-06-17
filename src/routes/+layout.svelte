<script lang="ts">
	import './layout.css';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/authStore';
	import { onMount } from 'svelte';

	let { children } = $props();
	let isLoggedIn = $state(false);
	let isLoading = $state(true);
	let canRender = $state(false);

	const publicRoutes = ['/login'];

	onMount(() => {
		// Si Firebase no responde en 5 segundos, mostrar la app de todas formas
		const fallbackTimer = setTimeout(() => {
			if (!canRender) {
				console.warn('[Layout] Firebase no respondió a tiempo. Mostrando app sin auth.');
				isLoading = false;
				canRender = true;
			}
		}, 5000);

		const unsubscribe = authStore.subscribe(state => {
			isLoggedIn = state.isLoggedIn;
			isLoading = state.loading;

			if (!state.loading) {
				clearTimeout(fallbackTimer);
				const currentPath = page.url.pathname;
				const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));

				if (state.isLoggedIn || isPublicRoute) {
					canRender = true;
				} else {
					canRender = false;
					goto('/login', { replaceState: true });
				}
			}
		});

		return () => {
			clearTimeout(fallbackTimer);
			unsubscribe();
		};
	});

	$effect(() => {
		if (isLoading) return;

		const currentPath = page.url.pathname;
		const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));

		if (isLoggedIn || isPublicRoute) {
			canRender = true;
		} else {
			canRender = false;
			goto('/login', { replaceState: true });
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="/images/icon_mecamblock.png" />
</svelte:head>

{#if isLoading}
	<div class="dark-page flex items-center justify-center h-screen">
		<div class="text-white text-xl">Cargando...</div>
	</div>
{:else if canRender}
	{@render children()}
{/if}
