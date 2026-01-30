import { create } from 'zustand';

interface MatriculaState {
    limit: number;
    totalSelectedDays: number;
    isLimitReached: boolean;

    // Actions
    setLimit: (limit: number) => void;
    setTotalSelectedDays: (days: number) => void;
    reset: () => void;
}

export const useMatriculaStore = create<MatriculaState>((set) => ({
    limit: 0,
    totalSelectedDays: 0,
    isLimitReached: false,

    setLimit: (limit) => set((state) => ({
        limit,
        isLimitReached: state.totalSelectedDays >= limit && limit > 0
    })),

    setTotalSelectedDays: (days) => set((state) => ({
        totalSelectedDays: days,
        isLimitReached: days >= state.limit && state.limit > 0
    })),

    reset: () => set({
        limit: 0,
        totalSelectedDays: 0,
        isLimitReached: false
    }),
}));
