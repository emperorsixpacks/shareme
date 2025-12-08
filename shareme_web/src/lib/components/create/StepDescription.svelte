<script lang="ts">
    import { contentStore, currentStep } from '$lib/stores/createContent';

    let description = '';

    contentStore.subscribe(data => {
        description = data.description;
    });

    function handleNext() {
        contentStore.setDescription(description);
        currentStep.set(4);
    }

    function handleBack() {
        currentStep.set(2);
    }
</script>

<div class="step-container">
    <div class="step-header">
        <h1 class="text-3xl font-bold mb-2">Add a description</h1>
        <p class="text-gray-400">Help buyers understand what they're getting (Optional)</p>
    </div>

    <div class="step-content">
        <div class="input-group">
            <label for="description" class="label">Description</label>
            <textarea
                id="description"
                bind:value={description}
                placeholder="Describe what buyers will get with this file..."
                class="textarea-field"
                rows="8"
                autofocus
            />
            <p class="hint">You can skip this step if you prefer</p>
        </div>
    </div>

    <div class="step-actions">
        <button on:click={handleBack} class="btn-secondary">
            ← Back
        </button>
        <button on:click={handleNext} class="btn-primary">
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

    .textarea-field {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        padding: 1rem;
        font-size: 1rem;
        color: white;
        transition: all 0.3s ease;
        resize: vertical;
        font-family: inherit;
    }

    .textarea-field:focus {
        outline: none;
        border-color: rgb(147, 51, 234);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
    }

    .textarea-field::placeholder {
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

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
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
