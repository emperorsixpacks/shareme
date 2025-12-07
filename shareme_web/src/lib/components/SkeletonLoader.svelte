<script lang="ts">
    export let type: 'text' | 'title' | 'card' | 'button' | 'avatar' = 'text';
    export let lines: number = 3;
</script>

{#if type === 'text'}
    <div class="skeleton-container">
        {#each Array(lines) as _, i}
            <div class="skeleton skeleton-text" style="width: {i === lines - 1 ? '70%' : '100%'}"></div>
        {/each}
    </div>
{:else if type === 'title'}
    <div class="skeleton skeleton-title"></div>
{:else if type === 'card'}
    <div class="skeleton-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton-card-content">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 80%"></div>
        </div>
    </div>
{:else if type === 'button'}
    <div class="skeleton skeleton-button"></div>
{:else if type === 'avatar'}
    <div class="skeleton skeleton-avatar"></div>
{/if}

<style>
    .skeleton-container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .skeleton {
        background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 8px;
    }

    .skeleton-text {
        height: 1rem;
        width: 100%;
    }

    .skeleton-title {
        height: 2rem;
        width: 60%;
        margin-bottom: 1rem;
    }

    .skeleton-button {
        height: 3rem;
        width: 150px;
        border-radius: 12px;
    }

    .skeleton-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }

    .skeleton-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .skeleton-image {
        height: 200px;
        width: 100%;
        border-radius: 0;
    }

    .skeleton-card-content {
        padding: 1.5rem;
    }

    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }
</style>
