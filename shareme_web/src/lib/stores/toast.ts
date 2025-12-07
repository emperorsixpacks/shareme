// Toast notification store
import { writable } from 'svelte/store';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}

function createToastStore() {
    const { subscribe, update } = writable<Toast[]>([]);

    return {
        subscribe,
        success: (message: string, duration = 3000) => {
            const id = Math.random().toString(36).substr(2, 9);
            update(toasts => [...toasts, { id, type: 'success', message, duration }]);
            setTimeout(() => remove(id), duration);
        },
        error: (message: string, duration = 4000) => {
            const id = Math.random().toString(36).substr(2, 9);
            update(toasts => [...toasts, { id, type: 'error', message, duration }]);
            setTimeout(() => remove(id), duration);
        },
        info: (message: string, duration = 3000) => {
            const id = Math.random().toString(36).substr(2, 9);
            update(toasts => [...toasts, { id, type: 'info', message, duration }]);
            setTimeout(() => remove(id), duration);
        },
        warning: (message: string, duration = 3500) => {
            const id = Math.random().toString(36).substr(2, 9);
            update(toasts => [...toasts, { id, type: 'warning', message, duration }]);
            setTimeout(() => remove(id), duration);
        },
        remove: (id: string) => {
            update(toasts => toasts.filter(t => t.id !== id));
        }
    };

    function remove(id: string) {
        update(toasts => toasts.filter(t => t.id !== id));
    }
}

export const toast = createToastStore();
