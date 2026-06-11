import { writable } from 'svelte/store';
import * as firestore from '$lib/services/firestore';
import type { Writable } from 'svelte/store';

export interface FirestoreStore<T> extends Writable<T[]> {
	add: (item: T) => Promise<void>;
	remove: (predicate: (t: T) => boolean) => void;
	replace: (predicate: (t: T) => boolean, replacer: (t: T) => T) => void;
}

export function createFirestoreStore<T extends { id?: string | number }>(
	collectionName: string
): FirestoreStore<T> {
	const { subscribe, set, update } = writable<T[]>([]);
	let initialized = false;

	if (typeof window !== 'undefined' && !initialized) {
		initialized = true;
		try {
			firestore.subscribe<T>(collectionName, (data) => {
				set(data);
			});
		} catch (e) {
			console.error(`Error suscribiéndose a ${collectionName}:`, e);
		}
	}

	return {
		subscribe,
		set,
		update,
		add: async (item) => {
			try {
				// Firestore genera su propio ID, eliminamos el id del objeto
				const { id, ...data } = item as any;
				await firestore.add<T>(collectionName, data as T);
			} catch (e) {
				console.error(`Error agregando en ${collectionName}:`, e);
				throw e;
			}
		},
		remove: (predicate) => {
			update(arr => {
				const toRemove = arr.filter(predicate);
				toRemove.forEach(item => {
					if (item.id) {
						firestore.remove(collectionName, String(item.id)).catch(e => {
							console.error(`Error eliminando de ${collectionName}:`, e);
						});
					}
				});
				return arr.filter(item => !predicate(item));
			});
		},
		replace: (predicate, replacer) => {
			update(arr => {
				const newArr = arr.map(item => predicate(item) ? replacer(item) : item);
				arr.forEach((item, i) => {
					if (predicate(item) && JSON.stringify(item) !== JSON.stringify(newArr[i])) {
						const updated = newArr[i];
						if (item.id) {
							const { id, ...data } = updated as any;
							firestore.update(collectionName, String(item.id), data).catch(e => {
								console.error(`Error actualizando en ${collectionName}:`, e);
							});
						}
					}
				});
				return newArr;
			});
		}
	};
}
