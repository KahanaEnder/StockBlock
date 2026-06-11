import { createFirestoreStore } from '$lib/stores/firestoreStore';
import type { Entrega } from '$lib/models/entrega';

export const entregasStore = createFirestoreStore<Entrega>('entregas');
