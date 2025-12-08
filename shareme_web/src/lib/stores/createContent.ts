import { writable } from 'svelte/store';

export type ContentType = 'article' | 'file' | null;

export interface ContentData {
    contentType: ContentType;
    title: string;
    content: string;
    file: File | null;
    fileBase64: string;
    description: string;
    price: number;
    enableSubscription: boolean;
    minAmount: number;
    maxAmount: number;
}

const initialData: ContentData = {
    contentType: null,
    title: '',
    content: '',
    file: null,
    fileBase64: '',
    description: '',
    price: 0,
    enableSubscription: false,
    minAmount: 0,
    maxAmount: 0,
};

function createContentStore() {
    const { subscribe, set, update } = writable<ContentData>(initialData);

    return {
        subscribe,
        setContentType: (type: ContentType) => update(data => ({ ...data, contentType: type })),
        setTitle: (title: string) => update(data => ({ ...data, title })),
        setContent: (content: string) => update(data => ({ ...data, content })),
        setFile: (file: File | null, fileBase64: string) => update(data => ({ ...data, file, fileBase64 })),
        setDescription: (description: string) => update(data => ({ ...data, description })),
        setPrice: (price: number) => update(data => ({ ...data, price })),
        setSubscription: (enableSubscription: boolean) => update(data => ({ ...data, enableSubscription })),
        setAmountRange: (minAmount: number, maxAmount: number) => update(data => ({ ...data, minAmount, maxAmount })),
        reset: () => set(initialData),
    };
}

export const contentStore = createContentStore();

// Current step store
export const currentStep = writable(0);
