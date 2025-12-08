<script lang="ts">
    import { contentStore, currentStep } from '$lib/stores/createContent';

    function selectType(type: 'article' | 'file') {
        contentStore.setContentType(type);
        currentStep.set(1);
    }
</script>

<div class="step-container">
    <div class="step-header">
        <h1 class="text-3xl font-bold mb-2">What would you like to create?</h1>
        <p class="text-gray-400">Choose the type of content you want to share</p>
    </div>

    <div class="choices-grid">
        <button
            on:click={() => selectType('article')}
            class="choice-card group"
        >
            <div class="icon-wrapper">
                <span class="text-5xl">✍️</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Write an Article</h3>
            <p class="text-gray-400 text-sm">
                Create rich-text content with formatting, images, and more
            </p>
            <div class="arrow">→</div>
        </button>

        <button
            on:click={() => selectType('file')}
            class="choice-card group"
        >
            <div class="icon-wrapper">
                <span class="text-5xl">📁</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Upload a File</h3>
            <p class="text-gray-400 text-sm">
                Share PDFs, videos, images, code, or any digital asset
            </p>
            <div class="arrow">→</div>
        </button>
    </div>
</div>

<style>
    .step-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .step-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .choices-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    .choice-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .choice-card:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(147, 51, 234, 0.5);
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(147, 51, 234, 0.2);
    }

    .icon-wrapper {
        margin-bottom: 1rem;
        transition: transform 0.3s ease;
    }

    .choice-card:hover .icon-wrapper {
        transform: scale(1.1);
    }

    .arrow {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        font-size: 1.5rem;
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.3s ease;
        color: rgb(147, 51, 234);
    }

    .choice-card:hover .arrow {
        opacity: 1;
        transform: translateX(0);
    }
</style>
