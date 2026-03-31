import { create } from 'zustand';
import type { SeparationRequest } from '../types/separation.types';
import { INITIAL_SEPARATIONS } from '../types/separation.types';

interface SeparationStore {
  requests: SeparationRequest[];
  addRequest: (request: SeparationRequest) => void;
  updateRequest: (id: string, patch: Partial<SeparationRequest>) => void;
}

export const useSeparationStore = create<SeparationStore>((set) => ({
  requests: INITIAL_SEPARATIONS,
  addRequest: (request) =>
    set((state) => ({ requests: [request, ...state.requests] })),
  updateRequest: (id, patch) =>
    set((state) => ({
      requests: state.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
}));
