<script lang="ts">
    import { contentStore, currentStep } from '$lib/stores/createContent';
    import { toast } from '$lib/stores/toast';
    import RichTextEditor from '$lib/components/RichTextEditor.svelte';

    let content = '';

    contentStore.subscribe(data => {
        content = data.content;
    });

    function handleNext() {
        if (!content.trim()) {
            toast.error('Please write some content');
            return;
        }
        contentStore.setContent(content);
        currentStep.set(3);
    }

    function handleBack() {
        currentStep.set(1);
    }
</script>

<div class="step-container">
    <div class="step-header">
        <h1 class="text-3xl font-bold mb-2">Write your article</h1>
        <p class="text-gray-400">Share your thoughts, knowledge, or story</p>
    </div>

    <div class="step-content">
        <div class="editor-wrapper">
            <RichTextEditor
                bind:content
                placeholder="Start writing your article here..."
            />
            <p class="hint">Use the toolbar to format your text</p>
        </div>
    </div>

    <div class="step-actions">
        <button on:click={handleBack} class="btn-secondary">
            ← Back
        </button>
        <button on:click={handleNext} class="btn-primary" disabled={!content.trim()}>
            Continue →
        </button>
    </div>
</div>

<style>
    .step-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
        min-height: 70vh;
        display: flex;
        flex-direction: column;
    }

    .step-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .step-content {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .editor-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .hint {
        margin-top: 0.75rem;
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.5);
    }

    .step-actions {
        display: flex;
        gap: 1rem;
        justify-content: space-between;
        margin-top: 2rem;
    }

    .btn-primary,
    .btn-secondary {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
        cursor: pointer;
        border: none;
    }

    .btn-primary {
        background: linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119));
        color: white;
        flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
    }
</style>
