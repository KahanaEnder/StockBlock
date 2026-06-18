import { writable } from 'svelte/store';
import { login as firebaseLogin, logout as firebaseLogout, onAuthChange } from '$lib/services/auth';
import type { AuthState } from 'src/app';

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		isLoggedIn: false,
		user: null,
		uid: null,
		loading: true
	});

	// Escuchar cambios de auth de Firebase
	if (typeof window !== 'undefined') {
		try {
			onAuthChange((user) => {
				if (user) {
					set({
						isLoggedIn: true,
						user: user.email,
						uid: user.uid,
						loading: false
					});
				} else {
					set({
						isLoggedIn: false,
						user: null,
						uid: null,
						loading: false
					});
				}
			});
		} catch (e) {
			console.error('[AuthStore] Error inicializando Firebase Auth:', e);
			// Si Firebase falla, desbloquear el loading para que la app sea usable
			set({
				isLoggedIn: false,
				user: null,
				uid: null,
				loading: false
			});
		}
	}

	return {
		subscribe,
		login: async (email: string, password: string) => {
			try {
				await firebaseLogin(email, password);
				return true;
			} catch (e) {
				console.error('Error en login:', e);
				return false;
			}
		},
		logout: async () => {
			try {
				await firebaseLogout();
			} catch (e) {
				console.error('Error en logout:', e);
			}
		}
	};
}

export const authStore = createAuthStore();
