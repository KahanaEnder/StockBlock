// https://svelte.dev/docs/kit/types#app.d.ts

/// <reference types="@sveltejs/kit" />

// ─── Global Auth State ───────────────────────────────────────
export interface AuthState {
	isLoggedIn: boolean;
	user: string | null;
	uid: string | null;
	loading: boolean;
}

// ─── SvelteKit App Declarations ──────────────────────────────
declare global {
	namespace App {
		/** Error returned by server load functions or form actions */
		interface Error {
			message: string;
			code?: number;
		}

		/** Data available to all pages via +page.svelte or +layout.svelte */
		interface PageData {
			/** Current user authenticated via Firebase (null if not logged in) */
			user?: {
				email: string;
				uid: string;
			} | null;
		}

		/** State preserved across navigations (e.g. scroll position) */
		interface PageState {
			scrollY?: number;
		}

		/** Platform-specific context (Cloudflare Workers, etc.) */
		interface Platform {
			env?: {
				MAILERSEND_API_KEY?: string;
			};
		}
	}
}

// ─── Vite Environment Variables ──────────────────────────────
/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_FIREBASE_API_KEY: string;
	readonly VITE_FIREBASE_AUTH_DOMAIN: string;
	readonly VITE_FIREBASE_PROJECT_ID: string;
	readonly VITE_FIREBASE_STORAGE_BUCKET: string;
	readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
	readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// ─── Svelte Module Declarations ──────────────────────────────
declare module '*.svelte' {
	import type { ComponentType } from 'svelte';
	const component: ComponentType;
	export default component;
}

declare module '$lib/components/*.svelte' {
	import type { ComponentType } from 'svelte';
	const component: ComponentType;
	export default component;
}

export {};
