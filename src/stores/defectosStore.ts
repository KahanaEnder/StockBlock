import { createFirestoreStore } from '$lib/stores/firestoreStore';
import type { Defecto } from '$lib/models/defecto';

export const defectosStore = createFirestoreStore<Defecto>('defectos');
