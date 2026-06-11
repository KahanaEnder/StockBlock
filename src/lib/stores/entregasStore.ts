import { createFirestoreStore } from './firestoreStore';
import type { Entrega } from '$lib/models/entrega';

export const entregasStore = createFirestoreStore<Entrega>('entregas');
