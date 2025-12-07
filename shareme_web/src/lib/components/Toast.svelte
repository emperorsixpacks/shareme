<script lang="ts">
    import { toast, type Toast } from '$lib/stores/toast';
    import { fly, fade } from 'svelte/transition';
    import { flip } from 'svelte/animate';

    let toasts: Toast[] = [];
    
    toast.subscribe(value => {
        toasts = value;
    });

    function getIcon(type: Toast['type']) {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
        }
    }

    function getColors(type: Toast['type']) {
        switch (type) {
            case 'success':
                return 'bg-green-500 border-green-400';
            case 'error':
                return 'bg-red-500 border-red-400';
            case 'warning':
                return 'bg-yellow-500 border-yellow-400';
            case 'info':
                return 'bg-blue-500 border-blue-400';
        }
    }
</script>

<div class="toast-container">
    {#each toasts as t (t.id)}
        <div
            class="toast {getColors(t.type)}"
            in:fly={{ y: -20, duration: 300 }}
            out:fade={{ duration: 200 }}
            animate:flip={{ duration: 200 }}
        >
            <div class="toast-icon">
                {getIcon(t.type)}
            </div>
            <div class="toast-message">
                {t.message}
            </div>
            <button
                class="toast-close"
                on:click={() => toast.remove(t.id)}
                aria-label="Close"
            >
                ✕
            </button>
        </div>
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        pointer-events: none;
    }

    .toast {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 300px;
        max-width: 500px;
        padding: 1rem 1.25rem;
        border-radius: 12px;
        border: 1.5px solid;
        color: white;
        font-size: 0.875rem;
        font-weight: 500;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        pointer-events: auto;
        backdrop-filter: blur(10px);
    }

    .toast-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        font-size: 14px;
        font-weight: bold;
        flex-shrink: 0;
    }

    .toast-message {
        flex: 1;
        line-height: 1.4;
    }

    .toast-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.2s ease;
        font-size: 12px;
        flex-shrink: 0;
    }

    .toast-close:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    @media (max-width: 640px) {
        .toast-container {
            top: 1rem;
            right: 1rem;
            left: 1rem;
        }

        .toast {
            min-width: auto;
            max-width: none;
        }
    }
</style>
