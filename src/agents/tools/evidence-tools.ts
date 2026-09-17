import { Evidence } from '../../domain/index.ts';
import { LocalEvidenceStore, EvidenceStore } from '../../evidence/store.ts';

let defaultEvidenceStore: EvidenceStore = new LocalEvidenceStore();

export function setEvidenceStore(store: EvidenceStore): void {
  defaultEvidenceStore = store;
}

export async function getEvidence(workerId: string): Promise<Evidence[]> {
  return defaultEvidenceStore.listEvidenceByWorker(workerId);
}

export async function getEvidenceById(id: string): Promise<Evidence | null> {
  return defaultEvidenceStore.getEvidence(id);
}

export async function getEvidenceByIds(ids: string[]): Promise<Evidence[]> {
  return defaultEvidenceStore.listEvidenceByIds(ids);
}
