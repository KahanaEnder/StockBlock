import { createFirestoreStore } from './firestoreStore';
import type { Defecto } from '$lib/models/defecto';

export const defectosStore = createFirestoreStore<Defecto>('defectos');
