<script lang="ts">
    import { contentStore, currentStep } from '$lib/stores/createContent';
    import { toast } from '$lib/stores/toast';

    let title = '';

    contentStore.subscribe(data => {
        title = data.title;
    });

    function handleNext() {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }
        contentStore.setTitle(title);
        currentStep.set(2);
    }

    function handleBack() {
        currentStep.set(0);
    }
</script>

<div class="step-container">
    <div class="step-header">
        <h1 class="text-3xl font-bold mb-2">Give your content a title</h1>
        <p class="text-gray-400">Make it catchy and descriptive</p>
    </div>

    <div class="step-content">
        <div class="input-group">
            <label for="title" class="label">Title</label>
            <input
                id="title"
                type="text"
                bind:value={title}
                placeholder="Enter your content title..."
                class="input-field"
                autofocus
                on:keydown={(e) => e.key === 'Enter' && handleNext()}
            />
            <p class="hint">This will be the first thing people see</p>
        </div>
    </div>

    <div class="step-actions">
        <button on:click={handleBack} class="btn-secondary">
            ← Back
        </button>
        <button on:click={handleNext} class="btn-primary" disabled={!title.trim()}>
            Continue →
        </button>
    </div>
</div>

<style>
    .step-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem 1rem;
        min-height: 60vh;
        display: flex;
        flex-direction: column;
    }

    .step-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .step-content {
        flex: 1;
    }

    .input-group {
        margin-bottom: 2rem;
    }

    .label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: rgba(255, 255, 255, 0.9);
    }

    .input-field {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        padding: 1rem;
        font-size: 1.125rem;
        color: white;
        transition: all 0.3s ease;
    }

    .input-field:focus {
        outline: none;
        border-color: rgb(147, 51, 234);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
    }

    .input-field::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }

    .hint {
        margin-top: 0.5rem;
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
