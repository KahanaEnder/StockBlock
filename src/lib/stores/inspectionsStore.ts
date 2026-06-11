import { createFirestoreStore } from './firestoreStore';
import { lotesStore } from './lotesStore';
import { get } from 'svelte/store';
import type { Inspection } from '$lib/models/inspection';
import { writable } from 'svelte/store';

export const inspectionsStore = createFirestoreStore<Inspection>('inspecciones');

export async function addInspection(ins: Inspection, opts: { usuario?: string; autoHold?: boolean } = {}) {
  await inspectionsStore.add(ins);

  if (opts.autoHold && ins.inspeccionado > 0) {
    const pct = (ins.defectuoso / ins.inspeccionado) * 100;
    const lotes = get(lotesStore);
    const lote = lotes.find(l => String(l.id) === String(ins.loteId));

    if (lote && pct > 10 && lote.estado !== 'en_espera') {
      lotesStore.replace(
        l => String(l.id) === String(ins.loteId),
        l => ({ ...l, estado: 'en_espera' as const, fechaModificacion: new Date().toISOString() })
      );
    }
  }
}

export function averagePercentageByProduct(producto: string): number {
  const inspecciones = get(inspectionsStore);
  const filtered = inspecciones.filter(i => i.producto === producto);
  if (filtered.length === 0) return 0;
  const totalPct = filtered.reduce((sum, i) => {
    return sum + (i.inspeccionado > 0 ? (i.defectuoso / i.inspeccionado) * 100 : 0);
  }, 0);
  return totalPct / filtered.length;
}
